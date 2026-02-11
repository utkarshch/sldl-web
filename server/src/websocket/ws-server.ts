import type { Server as HttpServer } from "node:http";
import { Server as SocketServer } from "socket.io";

let io: SocketServer;

export function initWebSocket(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://soulseekdownload.com",
        "https://www.soulseekdownload.com",
      ],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`[ws] Client connected: ${socket.id}`);

    socket.on("job:subscribe", ({ jobId }: { jobId: string }) => {
      socket.join(`job:${jobId}`);
    });

    socket.on("job:unsubscribe", ({ jobId }: { jobId: string }) => {
      socket.leave(`job:${jobId}`);
    });

    socket.on("dashboard:subscribe", () => {
      socket.join("dashboard");
    });

    socket.on("disconnect", () => {
      console.log(`[ws] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function emitToJob(jobId: string, event: string, data: unknown) {
  if (io) {
    io.to(`job:${jobId}`).emit(event, data);
  }
}

export function emitToDashboard(event: string, data: unknown) {
  if (io) {
    io.to("dashboard").emit(event, data);
  }
}

export function getIO(): SocketServer {
  return io;
}
