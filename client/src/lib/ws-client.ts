import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io("/", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on("connect", () => {
      console.log("[ws] Connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("[ws] Disconnected:", reason);
    });
  }
  return socket;
}

export function subscribeToJob(jobId: string) {
  getSocket().emit("job:subscribe", { jobId });
}

export function unsubscribeFromJob(jobId: string) {
  getSocket().emit("job:unsubscribe", { jobId });
}

export function subscribeToDashboard() {
  getSocket().emit("dashboard:subscribe");
}
