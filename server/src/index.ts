// Catch any uncaught errors so we can see them in Railway logs
process.on("uncaughtException", (err) => {
  console.error("[FATAL] Uncaught exception:", err);
});
process.on("unhandledRejection", (err) => {
  console.error("[FATAL] Unhandled rejection:", err);
});

console.log("[server] Starting... Node", process.version, "ENV:", process.env.NODE_ENV);

import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { initWebSocket, emitToJob, emitToDashboard } from "./websocket/ws-server.js";
import { SldlRunner } from "./services/sldl-runner.js";
import { SettingsStore } from "./services/settings-store.js";
import { createDownloadRoutes } from "./routes/download.routes.js";
import { createSettingsRoutes } from "./routes/settings.routes.js";
import { createUploadRoutes } from "./routes/upload.routes.js";
import { createAccountRoutes } from "./routes/account.routes.js";
import { AccountStore } from "./services/account-store.js";
import { requireAuth } from "./auth/auth-middleware.js";

console.log("[server] All imports loaded successfully");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || "3001", 10);

// Verify sldl binary exists
const binaryPath =
  process.env.SLDL_BINARY_PATH || path.resolve(__dirname, "../../sldl");

if (!fs.existsSync(binaryPath)) {
  console.error(`[server] WARNING: sldl binary not found at: ${binaryPath}`);
  console.error(`[server] Downloads will fail until fixed.`);
}

console.log(`[server] sldl binary path: ${binaryPath} (exists: ${fs.existsSync(binaryPath)})`);

// Initialize services
const settingsStore = new SettingsStore();
const accountStore = new AccountStore();
console.log("[server] Services initialized");

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

// Express app
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

// Routes
app.use("/api/downloads", requireAuth, createDownloadRoutes(runner, settingsStore, accountStore));
app.use("/api/settings", requireAuth, createSettingsRoutes(settingsStore));
app.use("/api/accounts", requireAuth, createAccountRoutes(accountStore));
app.use("/api/upload", requireAuth, createUploadRoutes());

app.get("/api/health", async (_req, res) => {
  let dbStatus = "unknown";
  try {
    await accountStore.getAccounts("00000000-0000-0000-0000-000000000000");
    dbStatus = "connected";
  } catch (err) {
    dbStatus = "disconnected";
    console.error("Health check DB error:", err);
  }

  res.json({
    status: "ok",
    version: process.env.npm_package_version || "1.0.1",
    binary: binaryPath,
    configured: settingsStore.isConfigured(),
    database: dbStatus,
    port: PORT
  });
});

console.log("[server] Routes configured, starting listener on port", PORT);

// HTTP + WebSocket server
const httpServer = createServer(app);
initWebSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`[server] Running on http://0.0.0.0:${PORT}`);
  console.log(`[server] Credentials configured: ${settingsStore.isConfigured()}`);
});
