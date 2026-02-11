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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || "3001", 10);

// Verify sldl binary exists
const binaryPath =
  process.env.SLDL_BINARY_PATH || path.resolve(__dirname, "../../sldl");

if (!fs.existsSync(binaryPath)) {
  console.error(`[server] sldl binary not found at: ${binaryPath}`);
  console.error(`[server] Set SLDL_BINARY_PATH env var or place binary in bin/`);
  process.exit(1);
}

console.log(`[server] sldl binary found at: ${binaryPath}`);

import { createAccountRoutes } from "./routes/account.routes.js";
import { AccountStore } from "./services/account-store.js";

// Initialize services
const settingsStore = new SettingsStore();
const accountStore = new AccountStore();

const runner = new SldlRunner((jobId, event, data) => {
  // ... (omitted for brevity in replacement, but I will target specific lines)

  // Routes
  app.use("/api/downloads", requireAuth, createDownloadRoutes(runner, settingsStore));
  app.use("/api/settings", requireAuth, createSettingsRoutes(settingsStore));
  app.use("/api/accounts", requireAuth, createAccountRoutes(accountStore));
  app.use("/api/upload", requireAuth, createUploadRoutes());
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
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"] }));
app.use(express.json());

import { requireAuth } from "./auth/auth-middleware.js";

// Routes
app.use("/api/downloads", requireAuth, createDownloadRoutes(runner, settingsStore));
app.use("/api/settings", requireAuth, createSettingsRoutes(settingsStore));
app.use("/api/accounts", requireAuth, createAccountRoutes(accountStore));
app.use("/api/upload", requireAuth, createUploadRoutes());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    binary: binaryPath,
    configured: settingsStore.isConfigured(),
  });
});

// HTTP + WebSocket server
const httpServer = createServer(app);
initWebSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`[server] Running on http://localhost:${PORT}`);
  console.log(`[server] Credentials configured: ${settingsStore.isConfigured()}`);
});
