import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { v4 as uuid } from "uuid";
import { parseLine } from "./output-parser.js";
import type {
  Job,
  JobState,
  JobProgress,
  InputType,
  DownloadMode,
  CreateJobRequest,
  ParsedEvent,
} from "../types/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BINARY_PATH =
  process.env.SLDL_BINARY_PATH ||
  path.resolve(__dirname, "../../../sldl");

const UPLOAD_DIR = path.resolve(__dirname, "../../data/uploads");

type JobEventCallback = (
  jobId: string,
  event: "output" | "state" | "exit",
  data: unknown
) => void;

export class SldlRunner {
  private jobs = new Map<string, Job & { process?: ChildProcess }>();
  private queue: string[] = [];
  private maxConcurrent: number;
  private onEvent: JobEventCallback;

  constructor(onEvent: JobEventCallback, maxConcurrent = 2) {
    this.onEvent = onEvent;
    this.maxConcurrent = maxConcurrent;
  }

  getJob(id: string): Job | undefined {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    const { process: _, ...rest } = job;
    return rest;
  }

  getAllJobs(): Job[] {
    return Array.from(this.jobs.values()).map(({ process: _, ...rest }) => rest);
  }

  private activeCount(): number {
    return Array.from(this.jobs.values()).filter(
      (j) => j.state === "running"
    ).length;
  }

  createJob(req: CreateJobRequest, settings: { username: string; password: string; downloadPath?: string }): Job {
    const job: Job & { process?: ChildProcess } = {
      id: uuid(),
      input: req.input,
      inputType: req.inputType || "search",
      downloadMode: req.downloadMode,
      flags: req.flags || {},
      state: "queued",
      progress: { total: 0, completed: 0, failed: 0, skipped: 0 },
      output: [],
      createdAt: new Date().toISOString(),
    };

    // Inject credentials and path into flags
    job.flags["user"] = settings.username;
    job.flags["pass"] = settings.password;
    if (settings.downloadPath) {
      job.flags["path"] = settings.downloadPath;
    }

    this.jobs.set(job.id, job);
    this.queue.push(job.id);
    this.processQueue();

    const { process: _, ...rest } = job;
    return rest;
  }

  cancelJob(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job) return false;

    if (job.state === "running" && job.process) {
      job.process.kill("SIGTERM");
      setTimeout(() => {
        if (job.process && !job.process.killed) {
          job.process.kill("SIGKILL");
        }
      }, 3000);
    }

    job.state = "cancelled";
    job.completedAt = new Date().toISOString();
    this.queue = this.queue.filter((qid) => qid !== id);

    this.emitState(id);
    this.processQueue();
    return true;
  }

  private processQueue() {
    while (this.activeCount() < this.maxConcurrent && this.queue.length > 0) {
      const jobId = this.queue.shift()!;
      const job = this.jobs.get(jobId);
      if (job && job.state === "queued") {
        this.startJob(job);
      }
    }
  }

  private buildArgs(job: Job): string[] {
    let input = job.input;
    if (job.inputType === "csv" && !path.isAbsolute(input)) {
      input = path.resolve(UPLOAD_DIR, input);
    }
    const args: string[] = [input];

    // Always pass these for web UI compatibility
    args.push("--no-progress");

    // Download mode flags
    if (job.downloadMode === "album" || job.downloadMode === "album-aggregate") {
      args.push("--album");
    }
    if (job.downloadMode === "aggregate" || job.downloadMode === "album-aggregate") {
      args.push("--aggregate");
    }

    // All other flags
    for (const [key, value] of Object.entries(job.flags)) {
      if (value === true) {
        args.push(`--${key}`);
      } else if (value !== false && value !== "" && value !== undefined) {
        args.push(`--${key}`, String(value));
      }
    }

    return args;
  }

  private startJob(job: Job & { process?: ChildProcess }) {
    job.state = "running";
    job.startedAt = new Date().toISOString();
    this.emitState(job.id);

    const args = this.buildArgs(job);
    console.log(`[sldl-runner] Starting job ${job.id}: ${BINARY_PATH} ${args.join(" ")}`);

    const proc = spawn(BINARY_PATH, args, {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env },
    });

    job.process = proc;

    const handleLine = (line: string) => {
      job.output.push(line);
      const parsed = parseLine(line);
      this.updateProgress(job, parsed);

      this.onEvent(job.id, "output", {
        jobId: job.id,
        line,
        parsed,
        timestamp: Date.now(),
      });
    };

    let stdoutBuffer = "";
    proc.stdout?.on("data", (chunk: Buffer) => {
      stdoutBuffer += chunk.toString();
      const lines = stdoutBuffer.split("\n");
      stdoutBuffer = lines.pop() || "";
      for (const line of lines) {
        if (line.trim()) handleLine(line);
      }
    });

    let stderrBuffer = "";
    proc.stderr?.on("data", (chunk: Buffer) => {
      stderrBuffer += chunk.toString();
      const lines = stderrBuffer.split("\n");
      stderrBuffer = lines.pop() || "";
      for (const line of lines) {
        if (line.trim()) handleLine(line);
      }
    });

    proc.on("close", (exitCode) => {
      // Flush remaining buffers
      if (stdoutBuffer.trim()) handleLine(stdoutBuffer);
      if (stderrBuffer.trim()) handleLine(stderrBuffer);

      if (job.state === "cancelled") return;

      job.state = exitCode === 0 ? "completed" : "failed";
      job.completedAt = new Date().toISOString();
      job.process = undefined;

      this.onEvent(job.id, "exit", {
        jobId: job.id,
        exitCode: exitCode ?? 1,
        summary: {
          succeeded: job.progress.completed,
          failed: job.progress.failed,
        },
      });

      this.emitState(job.id);
      this.processQueue();
    });

    proc.on("error", (err) => {
      console.error(`[sldl-runner] Process error for job ${job.id}:`, err);
      job.state = "failed";
      job.completedAt = new Date().toISOString();
      job.process = undefined;

      handleLine(`Error: ${err.message}`);
      this.emitState(job.id);
      this.processQueue();
    });
  }

  private updateProgress(job: Job, parsed: ParsedEvent) {
    switch (parsed.type) {
      case "completed":
        job.progress.completed++;
        break;
      case "failed":
        job.progress.failed++;
        break;
      case "skipped":
        job.progress.skipped++;
        break;
      case "searching":
        job.progress.currentTrack = parsed.track;
        break;
      case "downloading":
        job.progress.currentTrack = parsed.track;
        break;
      case "summary":
        job.progress.completed = parsed.succeeded;
        job.progress.failed = parsed.failed;
        break;
    }
  }

  private emitState(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;
    this.onEvent(jobId, "state", {
      jobId,
      state: job.state,
      progress: { ...job.progress },
    });
  }

  async preview(
    input: string,
    flags: Record<string, string | boolean | number>,
    settings: { username: string; password: string }
  ): Promise<string> {
    const isCsv =
      flags["input-type"] === "csv" ||
      input.toLocaleLowerCase().endsWith(".csv") ||
      input.toLocaleLowerCase().endsWith(".txt");

    const resolvedInput =
      isCsv && !path.isAbsolute(input)
        ? path.resolve(UPLOAD_DIR, input)
        : input;

    const args = [
      resolvedInput,
      "--print",
      "tracks",
      "--user",
      settings.username,
      "--pass",
      settings.password,
      "--no-progress",
    ];

    for (const [key, value] of Object.entries(flags)) {
      if (key === "user" || key === "pass") continue;
      if (value === true) {
        args.push(`--${key}`);
      } else if (value !== false && value !== "" && value !== undefined) {
        args.push(`--${key}`, String(value));
      }
    }

    return new Promise((resolve, reject) => {
      const proc = spawn(BINARY_PATH, args, { stdio: ["pipe", "pipe", "pipe"] });
      let output = "";
      let error = "";

      proc.stdout?.on("data", (chunk: Buffer) => {
        output += chunk.toString();
      });
      proc.stderr?.on("data", (chunk: Buffer) => {
        error += chunk.toString();
      });
      proc.on("close", (exitCode) => {
        if (exitCode === 0) {
          resolve(output);
        } else {
          reject(new Error(error || `sldl exited with code ${exitCode}`));
        }
      });
      proc.on("error", reject);

      // Timeout after 30 seconds
      setTimeout(() => {
        proc.kill("SIGTERM");
        reject(new Error("Preview timed out after 30 seconds"));
      }, 30000);
    });
  }
}
