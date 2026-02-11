import { create } from "zustand";
import type {
  Job,
  JobState,
  JobProgress,
  ParsedEvent,
  WsDashboardUpdate,
} from "../../../shared/types/index.ts";

interface DownloadState {
  jobs: Map<string, Job>;
  dashboardStats: WsDashboardUpdate;

  addJob: (job: Job) => void;
  updateJobState: (jobId: string, state: JobState, progress: JobProgress) => void;
  appendOutput: (jobId: string, line: string, parsed?: ParsedEvent) => void;
  setJobs: (jobs: Job[]) => void;
  setDashboardStats: (stats: WsDashboardUpdate) => void;
  getJob: (id: string) => Job | undefined;
  getJobList: () => Job[];
}

export const useDownloadStore = create<DownloadState>((set, get) => ({
  jobs: new Map(),
  dashboardStats: {
    activeJobs: 0,
    queuedJobs: 0,
    completedToday: 0,
    totalDownloaded: 0,
  },

  addJob: (job) =>
    set((s) => {
      const next = new Map(s.jobs);
      next.set(job.id, job);
      return { jobs: next };
    }),

  updateJobState: (jobId, state, progress) =>
    set((s) => {
      const next = new Map(s.jobs);
      const existing = next.get(jobId);
      if (existing) {
        next.set(jobId, { ...existing, state, progress });
      }
      return { jobs: next };
    }),

  appendOutput: (jobId, line, _parsed) =>
    set((s) => {
      const next = new Map(s.jobs);
      const existing = next.get(jobId);
      if (existing) {
        next.set(jobId, {
          ...existing,
          output: [...existing.output, line],
        });
      }
      return { jobs: next };
    }),

  setJobs: (jobs) =>
    set(() => {
      const map = new Map<string, Job>();
      for (const j of jobs) map.set(j.id, j);
      return { jobs: map };
    }),

  setDashboardStats: (stats) => set({ dashboardStats: stats }),

  getJob: (id) => get().jobs.get(id),

  getJobList: () => Array.from(get().jobs.values()),
}));
