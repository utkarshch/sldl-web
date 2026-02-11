import { useEffect, useRef } from "react";
import { getSocket, subscribeToDashboard } from "@/lib/ws-client";
import { useDownloadStore } from "@/stores/download-store";
import type {
  WsJobOutput,
  WsJobState,
  WsJobExit,
  WsDashboardUpdate,
} from "../../../shared/types/index.ts";

export function useDashboardSocket() {
  const { updateJobState, appendOutput, setDashboardStats } =
    useDownloadStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const socket = getSocket();
    subscribeToDashboard();

    socket.on("job:output", (data: WsJobOutput) => {
      appendOutput(data.jobId, data.line, data.parsed);
    });

    socket.on("job:state", (data: WsJobState) => {
      updateJobState(data.jobId, data.state, data.progress);
    });

    socket.on("job:exit", (_data: WsJobExit) => {
      // State update already handled by job:state
    });

    socket.on("dashboard:update", (data: WsDashboardUpdate) => {
      setDashboardStats(data);
    });

    return () => {
      socket.off("job:output");
      socket.off("job:state");
      socket.off("job:exit");
      socket.off("dashboard:update");
    };
  }, [updateJobState, appendOutput, setDashboardStats]);
}

export function useJobSocket(jobId: string | undefined) {
  const { appendOutput, updateJobState } = useDownloadStore();

  useEffect(() => {
    if (!jobId) return;

    const socket = getSocket();
    socket.emit("job:subscribe", { jobId });

    const onOutput = (data: WsJobOutput) => {
      if (data.jobId === jobId) {
        appendOutput(data.jobId, data.line, data.parsed);
      }
    };

    const onState = (data: WsJobState) => {
      if (data.jobId === jobId) {
        updateJobState(data.jobId, data.state, data.progress);
      }
    };

    socket.on("job:output", onOutput);
    socket.on("job:state", onState);

    return () => {
      socket.emit("job:unsubscribe", { jobId });
      socket.off("job:output", onOutput);
      socket.off("job:state", onState);
    };
  }, [jobId, appendOutput, updateJobState]);
}
