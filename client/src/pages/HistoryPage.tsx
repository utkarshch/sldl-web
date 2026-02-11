import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn, inputTypeLabel, formatTimestamp } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { useDownloadStore } from "@/stores/download-store";
import { CheckCircle2, XCircle, Clock, Square } from "lucide-react";
import type { Job } from "../../../shared/types/index.ts";

export function HistoryPage() {
  const navigate = useNavigate();
  const { setJobs, getJobList } = useDownloadStore();

  const loadJobs = useCallback(async () => {
    try {
      const jobs = await api.getDownloads();
      setJobs(jobs as unknown as Job[]);
    } catch {
      // ignore
    }
  }, [setJobs]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const jobs = getJobList().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const stateIcons: Record<string, React.ElementType> = {
    completed: CheckCircle2,
    failed: XCircle,
    running: Clock,
    queued: Clock,
    cancelled: Square,
  };

  const stateColors: Record<string, string> = {
    completed: "text-accent",
    failed: "text-destructive",
    running: "text-primary",
    queued: "text-text-muted",
    cancelled: "text-text-faint",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-3xl tracking-tight">History</h1>
        <p className="text-text-muted mt-1">All your downloads, past and present.</p>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-muted text-sm">No download history yet.</p>
        </div>
      ) : (
        <div className="rounded-xl bg-surface border border-border shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-hover/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Input
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Mode
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Tracks
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.map((job) => {
                const { label, color } = inputTypeLabel(job.inputType);
                const Icon = stateIcons[job.state] || Clock;
                return (
                  <tr
                    key={job.id}
                    onClick={() => navigate(`/downloads/${job.id}`)}
                    className="hover:bg-surface-hover cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium truncate max-w-[250px]">
                      {job.input}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", color)}>
                        {label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted capitalize">
                      {job.downloadMode.replace("-", " ")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Icon className={cn("h-3.5 w-3.5", stateColors[job.state])} />
                        <span className={cn("text-xs font-medium capitalize", stateColors[job.state])}>
                          {job.state}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted tabular-nums">
                      {job.progress.completed}/{job.progress.completed + job.progress.failed + job.progress.skipped}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-faint">
                      {formatTimestamp(job.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
