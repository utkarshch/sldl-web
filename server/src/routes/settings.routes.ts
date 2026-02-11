import { Router } from "express";
import type { SettingsStore } from "../services/settings-store.js";

export function createSettingsRoutes(settingsStore: SettingsStore): Router {
  const router = Router();

  router.get("/", (_req, res) => {
    const settings = settingsStore.get();
    // Mask password in response
    res.json({
      ...settings,
      soulseek: {
        ...settings.soulseek,
        password: settings.soulseek.password ? "••••••••" : "",
      },
    });
  });

  router.put("/", (req, res) => {
    const updated = settingsStore.update(req.body);
    res.json(updated);
  });

  router.get("/status", (_req, res) => {
    res.json({ configured: settingsStore.isConfigured() });
  });

  return router;
}
