import { useEffect, useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn, inputTypeLabel, formatTimestamp } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { useDownloadStore } from "@/stores/download-store";
import { useJobSocket } from "@/hooks/use-websocket";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Square,
  RotateCcw,
  Terminal,
  List,
} from "lucide-react";
import type { Job } from "../../../shared/types/index.ts";

export function DownloadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJob, addJob } = useDownloadStore();
  const [activeTab, setActiveTab] = useState<"tracks" | "log">("tracks");

  useJobSocket(id);

  const loadJob = useCallback(async () => {
    if (!id) return;
    try {
      const job = (await api.getDownload(id)) as unknown as Job;
      addJob(job);
    } catch {
      // job not found
    }
  }, [id, addJob]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  const job = id ? getJob(id) : undefined;

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
      </div>
    );
  }

  const { label: typeLabel, color: typeColor } = inputTypeLabel(job.inputType);
  const totalProcessed =
    job.progress.completed + job.progress.failed + job.progress.skipped;

  const handleCancel = async () => {
    try {
      await api.cancelDownload(job.id);
    } catch {
      // ignore
    }
  };

  const stateDisplay: Record<
    string,
    { icon: React.ElementType; label: string; color: string; bg: string }
  > = {
    running: {
      icon: Loader2,
      label: "Downloading",
      color: "text-primary",
      bg: "bg-primary-light",
    },
    queued: {
      icon: Clock,
      label: "Queued",
      color: "text-text-muted",
      bg: "bg-surface-hover",
    },
    completed: {
      icon: CheckCircle2,
      label: "Completed",
      color: "text-accent",
      bg: "bg-accent-light",
    },
    failed: {
      icon: XCircle,
      label: "Failed",
      color: "text-destructive",
      bg: "bg-destructive-light",
    },
    cancelled: {
      icon: Square,
      label: "Cancelled",
      color: "text-text-faint",
      bg: "bg-surface-hover",
    },
  };

  const state = stateDisplay[job.state] || stateDisplay.queued;
  const StateIcon = state.icon;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Header card */}
      <div className="rounded-xl bg-surface border border-border shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="font-display font-bold text-xl truncate">
              {job.input}
            </h1>
            <div className="flex items-center gap-2.5 mt-2">
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", typeColor)}>
                {typeLabel}
              </span>
              <span className="text-xs text-text-faint capitalize">
                {job.downloadMode.replace("-", " ")} mode
              </span>
              <span className="text-xs text-text-faint">
                {formatTimestamp(job.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {job.state === "running" && (
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive-light px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <Square className="h-3 w-3" />
                Cancel
              </button>
            )}
            {(job.state === "failed" || job.state === "cancelled") && (
              <button
                onClick={loadJob}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-hover"
              >
                <RotateCcw className="h-3 w-3" />
                Retry
              </button>
            )}
          </div>
        </div>

        {/* Status + Progress */}
        <div className="mt-5 flex items-center gap-4">
          <div className={cn("flex items-center gap-2 rounded-full px-3 py-1.5", state.bg)}>
            <StateIcon
              className={cn("h-3.5 w-3.5", state.color, job.state === "running" && "animate-spin")}
            />
            <span className={cn("text-xs font-semibold", state.color)}>
              {state.label}
            </span>
          </div>

          <div className="flex-1">
            <div className="h-2 w-full rounded-full bg-surface-hover overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  job.state === "completed"
                    ? "bg-accent"
                    : job.state === "failed"
                    ? "bg-destructive"
                    : "bg-primary"
                )}
                style={{
                  width:
                    job.progress.total > 0
                      ? `${Math.round((totalProcessed / job.progress.total) * 100)}%`
                      : job.state === "completed"
                      ? "100%"
                      : "0%",
                }}
              />
            </div>
          </div>

          <div className="text-xs text-text-muted tabular-nums shrink-0">
            {job.progress.completed} done
            {job.progress.failed > 0 && ` · ${job.progress.failed} failed`}
            {job.progress.skipped > 0 && ` · ${job.progress.skipped} skipped`}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        <button
          onClick={() => setActiveTab("tracks")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
            activeTab === "tracks"
              ? "border-primary text-primary"
              : "border-transparent text-text-muted hover:text-text"
          )}
        >
          <List className="h-4 w-4" />
          Output
        </button>
        <button
          onClick={() => setActiveTab("log")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
            activeTab === "log"
              ? "border-primary text-primary"
              : "border-transparent text-text-muted hover:text-text"
          )}
        >
          <Terminal className="h-4 w-4" />
          Live Log
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "tracks" ? (
        <div className="rounded-xl bg-surface border border-border shadow-sm overflow-hidden">
          {job.output.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-muted">
              {job.state === "queued"
                ? "Waiting in queue..."
                : "Waiting for output..."}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {job.output.slice(-100).map((line, i) => (
                <div
                  key={i}
                  className="px-4 py-2.5 text-sm font-mono text-text-secondary hover:bg-surface-hover transition-colors"
                >
                  {line}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-stone-900 border border-stone-800 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-800">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-stone-700" />
              <div className="h-2.5 w-2.5 rounded-full bg-stone-700" />
              <div className="h-2.5 w-2.5 rounded-full bg-stone-700" />
            </div>
            <span className="text-xs text-stone-500 font-mono">sldl output</span>
          </div>
          <div className="p-4 max-h-[500px] overflow-y-auto">
            {job.output.length === 0 ? (
              <p className="text-sm text-stone-500 font-mono">
                {job.state === "queued"
                  ? "$ waiting in queue..."
                  : "$ waiting for output..."}
              </p>
            ) : (
              <pre className="text-xs text-stone-300 font-mono whitespace-pre-wrap leading-relaxed">
                {job.output.join("\n")}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
