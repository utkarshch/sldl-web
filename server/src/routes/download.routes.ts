import { Router } from "express";
import type { SldlRunner } from "../services/sldl-runner.js";
import type { SettingsStore } from "../services/settings-store.js";
import type { CreateJobRequest } from "../types/index.js";

export function createDownloadRoutes(
  runner: SldlRunner,
  settingsStore: SettingsStore
): Router {
  const router = Router();

  // Create a new download job
  router.post("/", (req, res) => {
    const body = req.body as CreateJobRequest;

    if (!body.input) {
      res.status(400).json({ error: "Input is required" });
      return;
    }

    const settings = settingsStore.get();
    if (!settings.soulseek.username || !settings.soulseek.password) {
      res.status(400).json({ error: "Soulseek credentials not configured" });
      return;
    }

    const job = runner.createJob(body, {
      username: settings.soulseek.username,
      password: settings.soulseek.password,
      downloadPath: settings.defaults.downloadPath,
    });

    res.status(201).json(job);
  });

  // List all jobs
  router.get("/", (_req, res) => {
    const jobs = runner.getAllJobs();
    res.json(jobs);
  });

  // Get a single job
  router.get("/:id", (req, res) => {
    const job = runner.getJob(req.params.id);
    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    res.json(job);
  });

  // Cancel a job
  router.delete("/:id", (req, res) => {
    const success = runner.cancelJob(req.params.id);
    if (!success) {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    res.json({ success: true });
  });

  // Preview (dry run)
  router.post("/preview", async (req, res) => {
    const { input, flags } = req.body as {
      input: string;
      flags?: Record<string, string | boolean | number>;
    };

    if (!input) {
      res.status(400).json({ error: "Input is required" });
      return;
    }

    const settings = settingsStore.get();
    try {
      const output = await runner.preview(input, flags || {}, {
        username: settings.soulseek.username,
        password: settings.soulseek.password,
      });
      res.json({ output });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Preview failed";
      res.status(500).json({ error: message });
    }
  });

  return router;
}
