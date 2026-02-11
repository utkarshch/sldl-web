import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api-client";
import { cn, detectInputType, inputTypeLabel, formatTimestamp } from "@/lib/utils";
import { useDownloadStore } from "@/stores/download-store";
import { useDashboardSocket } from "@/hooks/use-websocket";
import {
  Search,
  ArrowRight,
  Download,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
} from "lucide-react";
import type { Job } from "../../../shared/types/index.ts";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl bg-surface border border-border p-5 shadow-sm shadow-black/[0.02]">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold font-display tabular-nums">{value}</p>
          <p className="text-xs text-text-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const navigate = useNavigate();
  const { label, color } = inputTypeLabel(job.inputType);

  const stateConfig: Record<string, { icon: React.ElementType; color: string; text: string }> = {
    running: { icon: Loader2, color: "text-primary", text: "Downloading" },
    queued: { icon: Clock, color: "text-text-muted", text: "Queued" },
    completed: { icon: CheckCircle2, color: "text-accent", text: "Completed" },
    failed: { icon: XCircle, color: "text-destructive", text: "Failed" },
    cancelled: { icon: XCircle, color: "text-text-faint", text: "Cancelled" },
  };

  const state = stateConfig[job.state] || stateConfig.queued;
  const StateIcon = state.icon;

  return (
    <button
      onClick={() => navigate(`/downloads/${job.id}`)}
      className="w-full text-left rounded-xl bg-surface border border-border p-4 shadow-sm shadow-black/[0.02] transition-all duration-150 hover:shadow-md hover:border-border-strong hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate">{job.input}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", color)}>
              {label}
            </span>
            <span className="text-xs text-text-faint">
              {formatTimestamp(job.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <StateIcon
            className={cn(
              "h-4 w-4",
              state.color,
              job.state === "running" && "animate-spin"
            )}
          />
          <span className={cn("text-xs font-medium", state.color)}>
            {state.text}
          </span>
        </div>
      </div>

      {/* Progress bar for running jobs */}
      {job.state === "running" && job.progress.total > 0 && (
        <div className="mt-3">
          <div className="h-1.5 w-full rounded-full bg-primary-light overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{
                width: `${Math.round(
                  ((job.progress.completed + job.progress.failed) /
                    job.progress.total) *
                  100
                )}%`,
              }}
            />
          </div>
          <p className="text-xs text-text-muted mt-1">
            {job.progress.completed} of {job.progress.total} tracks
            {job.progress.failed > 0 && ` · ${job.progress.failed} failed`}
          </p>
        </div>
      )}
    </button>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { setJobs, getJobList, dashboardStats } =
    useDownloadStore();
  const [searchValue, setSearchValue] = useState("");

  useDashboardSocket();

  const loadJobs = useCallback(async () => {
    try {
      const jobs = await api.getDownloads();
      setJobs(jobs as unknown as Job[]);
    } catch {
      // ignore on initial load
    }
  }, [setJobs]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const jobs = getJobList();
  const activeJobs = jobs.filter(
    (j) => j.state === "running" || j.state === "queued"
  );
  const recentJobs = jobs
    .filter((j) => j.state === "completed" || j.state === "failed")
    .slice(0, 5);

  const handleSearch = () => {
    if (!searchValue.trim()) return;
    const detectedType = detectInputType(searchValue);
    navigate("/new", {
      state: { input: searchValue, inputType: detectedType },
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl tracking-tight">Dashboard</h1>
        <p className="text-text-muted mt-1">Search, download, and manage your music.</p>
      </div>

      {/* Quick Search */}
      <div className="relative">
        <div className="flex items-center rounded-xl border border-border bg-surface shadow-sm shadow-black/[0.02] overflow-hidden transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-light">
          <Search className="h-5 w-5 text-text-faint ml-4" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search for music, or paste a Spotify / YouTube / Bandcamp URL..."
            className="flex-1 bg-transparent px-3 py-3.5 text-sm outline-none placeholder:text-text-faint"
          />
          {searchValue && (
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium mr-2",
                inputTypeLabel(detectInputType(searchValue)).color
              )}
            >
              {inputTypeLabel(detectInputType(searchValue)).label}
            </span>
          )}
          <button
            onClick={handleSearch}
            disabled={!searchValue.trim()}
            className="flex items-center gap-1.5 bg-primary text-white px-5 py-3.5 text-sm font-semibold transition-colors hover:bg-primary-hover disabled:opacity-40"
          >
            Go
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Active"
          value={dashboardStats.activeJobs}
          icon={Loader2}
        />
        <StatCard
          label="In Queue"
          value={dashboardStats.queuedJobs}
          icon={Clock}
        />
        <StatCard
          label="Completed Today"
          value={dashboardStats.completedToday}
          icon={CheckCircle2}
        />
        <StatCard
          label="Total Downloads"
          value={dashboardStats.totalDownloaded}
          icon={Download}
        />
      </div>

      {/* Active Downloads */}
      {activeJobs.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-lg">Active Downloads</h2>
          <div className="grid gap-3">
            {activeJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}

      {/* Recent */}
      {recentJobs.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-lg">Recent</h2>
          <div className="grid gap-3">
            {recentJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}

      {jobs.length === 0 && (
        <div className="text-center py-16">
          <p className="text-text-muted text-sm">
            No downloads yet. Use the search bar above to get started.
          </p>
        </div>
      )}
    </div>
  );
}
