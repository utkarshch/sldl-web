// Catch any uncaught errors so we can see them in Railway logs
process.on("uncaughtException", (err) => {
  console.error("[FATAL] Uncaught exception:", err);
});
process.on("unhandledRejection", (err) => {
  console.error("[FATAL] Unhandled rejection:", err);
});

console.log("[server] Starting... Node", process.version, "ENV:", process.env.NODE_ENV);
console.log("[server] PORT env:", process.env.PORT);
console.log("[server] SUPABASE_URL set:", !!process.env.SUPABASE_URL);
console.log("[server] SUPABASE_SERVICE_ROLE_KEY set:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || "3001", 10);

// Create Express app immediately
const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://soulseekdownload.com",
    "https://www.soulseekdownload.com"
  ]
}));
app.use(express.json());

// Track what initialized successfully
const initStatus: Record<string, string> = {};
let initError: string | null = null;

// Health endpoint — registered FIRST, always works
app.get("/api/health", (_req, res) => {
  res.json({
    status: initError ? "degraded" : "ok",
    version: "1.0.2",
    port: PORT,
    initStatus,
    initError,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      SUPABASE_URL_SET: !!process.env.SUPABASE_URL,
      SUPABASE_KEY_SET: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  });
});

// Start HTTP server IMMEDIATELY so Railway sees a response
const httpServer = createServer(app);
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`[server] Listening on http://0.0.0.0:${PORT}`);
  // Initialize everything after the server is already listening
  init().catch((err) => {
    console.error("[server] INIT FAILED:", err);
    initError = String(err);
  });
});

async function init() {
  // WebSocket
  console.log("[server] Initializing WebSocket...");
  const { initWebSocket, emitToJob, emitToDashboard } = await import("./websocket/ws-server.js");
  initWebSocket(httpServer);
  initStatus.websocket = "ok";

  // Settings
  console.log("[server] Initializing SettingsStore...");
  const { SettingsStore } = await import("./services/settings-store.js");
  const settingsStore = new SettingsStore();
  initStatus.settings = "ok";

  // Accounts
  console.log("[server] Initializing AccountStore...");
  const { AccountStore } = await import("./services/account-store.js");
  const accountStore = new AccountStore();
  initStatus.accounts = "ok";

  // Runner
  console.log("[server] Initializing SldlRunner...");
  const { SldlRunner } = await import("./services/sldl-runner.js");

  function getDashboardStats() {
    const jobs = runner.getAllJobs();
    const today = new Date().toISOString().slice(0, 10);
    return {
      activeJobs: jobs.filter((j) => j.state === "running").length,
      queuedJobs: jobs.filter((j) => j.state === "queued").length,
      completedToday: jobs.filter(
        (j) => j.state === "completed" && j.completedAt?.startsWith(today)
      ).length,
      totalDownloaded: jobs.reduce((sum, j) => sum + j.progress.completed, 0),
    };
  }

  const runner = new SldlRunner((jobId, event, data) => {
    switch (event) {
      case "output":
        emitToJob(jobId, "job:output", data);
        break;
      case "state":
        emitToJob(jobId, "job:state", data);
        emitToDashboard("dashboard:update", getDashboardStats());
        break;
      case "exit":
        emitToJob(jobId, "job:exit", data);
        emitToDashboard("dashboard:update", getDashboardStats());
        break;
    }
  }, settingsStore.get().defaults.concurrentDownloads);
  initStatus.runner = "ok";

  // Routes
  console.log("[server] Registering routes...");
  const { requireAuth } = await import("./auth/auth-middleware.js");
  const { createDownloadRoutes } = await import("./routes/download.routes.js");
  const { createSettingsRoutes } = await import("./routes/settings.routes.js");
  const { createUploadRoutes } = await import("./routes/upload.routes.js");
  const { createAccountRoutes } = await import("./routes/account.routes.js");

  app.use("/api/downloads", requireAuth, createDownloadRoutes(runner, settingsStore, accountStore));
  app.use("/api/settings", requireAuth, createSettingsRoutes(settingsStore));
  app.use("/api/accounts", requireAuth, createAccountRoutes(accountStore));
  app.use("/api/upload", requireAuth, createUploadRoutes());
  initStatus.routes = "ok";

  // Verify sldl binary
  const binaryPath = process.env.SLDL_BINARY_PATH || path.resolve(__dirname, "../../sldl");
  initStatus.binary = fs.existsSync(binaryPath) ? "found" : "missing";
  console.log(`[server] sldl binary: ${binaryPath} (exists: ${fs.existsSync(binaryPath)})`);

  console.log("[server] Fully initialized!");
}
