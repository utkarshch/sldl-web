import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { SldlSettings } from "../types/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../data");
const SETTINGS_PATH = path.join(DATA_DIR, "settings.json");

const DEFAULT_SETTINGS: SldlSettings = {
  soulseek: {
    username: "",
    password: "",
  },
  defaults: {
    downloadPath: path.resolve(DATA_DIR, "downloads"),
    concurrentDownloads: 2,
    nameFormat: "{artist} - {title}",
    writePlaylist: false,
    formats: ["mp3"],
    strictTitle: false,
    strictArtist: false,
    strictAlbum: false,
    fastSearch: true,
    desperateMode: false,
    artistMaybeWrong: false,
    removeFt: true,
    searchTimeout: 6000,
    bannedUsers: [],
    ytDlpFallback: false,
    albumArt: "default",
  },
};

export class SettingsStore {
  private settings: SldlSettings;

  constructor() {
    this.settings = this.load();
  }

  private load(): SldlSettings {
    try {
      if (fs.existsSync(SETTINGS_PATH)) {
        const raw = fs.readFileSync(SETTINGS_PATH, "utf-8");
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      }
    } catch (err) {
      console.error("[settings-store] Failed to load settings:", err);
    }
    return { ...DEFAULT_SETTINGS };
  }

  get(): SldlSettings {
    return { ...this.settings };
  }

  update(partial: Partial<SldlSettings>): SldlSettings {
    this.settings = {
      ...this.settings,
      ...partial,
      soulseek: { ...this.settings.soulseek, ...partial.soulseek },
      defaults: { ...this.settings.defaults, ...partial.defaults },
    };
    if (partial.spotify) {
      this.settings.spotify = { ...this.settings.spotify, ...partial.spotify };
    }
    if (partial.youtube) {
      this.settings.youtube = { ...this.settings.youtube, ...partial.youtube };
    }
    this.save();
    return this.get();
  }

  private save() {
    try {
      fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true });
      fs.writeFileSync(SETTINGS_PATH, JSON.stringify(this.settings, null, 2));
    } catch (err) {
      console.error("[settings-store] Failed to save settings:", err);
    }
  }

  isConfigured(): boolean {
    return !!(this.settings.soulseek.username && this.settings.soulseek.password);
  }
}
