import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import {
  User,
  Music,
  Sliders,
  Search,
  FolderOutput,
  Loader2,
  CheckCircle2,
} from "lucide-react";

type Tab = "credentials" | "integrations" | "quality" | "search" | "output";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "credentials", label: "Credentials", icon: User },
  { id: "integrations", label: "Integrations", icon: Music },
  { id: "quality", label: "Quality", icon: Sliders },
  { id: "search", label: "Search", icon: Search },
  { id: "output", label: "Output", icon: FolderOutput },
];

const FORMAT_OPTIONS = ["mp3", "flac", "ogg", "wav", "aac", "opus"];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("credentials");
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const s = await api.getSettings();
      setSettings(s);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const soulseek = (settings.soulseek || {}) as Record<string, string>;
  const spotify = (settings.spotify || {}) as Record<string, string>;
  const youtube = (settings.youtube || {}) as Record<string, string>;
  const defaults = (settings.defaults || {}) as Record<string, unknown>;

  const update = (path: string, value: unknown) => {
    const keys = path.split(".");
    const next = { ...settings };
    let obj: Record<string, unknown> = next;
    for (let i = 0; i < keys.length - 1; i++) {
      obj[keys[i]] = { ...(obj[keys[i]] as Record<string, unknown> || {}) };
      obj = obj[keys[i]] as Record<string, unknown>;
    }
    obj[keys[keys.length - 1]] = value;
    setSettings(next);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl tracking-tight">Settings</h1>
          <p className="text-text-muted mt-1">Configure credentials, quality defaults, and output.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : null}
          {saved ? "Saved" : "Save Changes"}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Tab list */}
        <div className="w-48 shrink-0 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left",
                activeTab === tab.id
                  ? "bg-primary-light text-primary"
                  : "text-text-muted hover:bg-surface-hover hover:text-text"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 rounded-xl bg-surface border border-border shadow-sm p-6">
          {activeTab === "credentials" && (
            <div className="space-y-5">
              <h2 className="font-display font-semibold text-base">Soulseek Account</h2>
              <div className="grid gap-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Username</label>
                  <input
                    type="text"
                    value={soulseek.username || ""}
                    onChange={(e) => update("soulseek.username", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Password</label>
                  <input
                    type="password"
                    value={soulseek.password || ""}
                    onChange={(e) => update("soulseek.password", e.target.value)}
                    placeholder={soulseek.password === "••••••••" ? "••••••••" : ""}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="font-display font-semibold text-base">Spotify</h2>
                <div className="grid gap-4 max-w-md">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-secondary">Client ID</label>
                    <input
                      type="text"
                      value={spotify.clientId || ""}
                      onChange={(e) => update("spotify.clientId", e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-secondary">Client Secret</label>
                    <input
                      type="password"
                      value={spotify.clientSecret || ""}
                      onChange={(e) => update("spotify.clientSecret", e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-secondary">Token</label>
                    <input
                      type="text"
                      value={spotify.token || ""}
                      onChange={(e) => update("spotify.token", e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6 space-y-4">
                <h2 className="font-display font-semibold text-base">YouTube</h2>
                <div className="max-w-md space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">API Key</label>
                  <input
                    type="text"
                    value={youtube.apiKey || ""}
                    onChange={(e) => update("youtube.apiKey", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "quality" && (
            <div className="space-y-5">
              <h2 className="font-display font-semibold text-base">Default Quality Filters</h2>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Preferred Formats</label>
                <div className="flex flex-wrap gap-2">
                  {FORMAT_OPTIONS.map((f) => {
                    const formats = (defaults.formats as string[] || []);
                    const active = formats.includes(f);
                    return (
                      <button
                        key={f}
                        onClick={() => {
                          const next = active
                            ? formats.filter((x) => x !== f)
                            : [...formats, f];
                          update("defaults.formats", next);
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                          active
                            ? "border-primary bg-primary-light text-primary"
                            : "border-border text-text-muted hover:border-border-strong"
                        )}
                      >
                        {f.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Min Bitrate</label>
                  <input
                    type="number"
                    value={(defaults.minBitrate as number) || ""}
                    onChange={(e) => update("defaults.minBitrate", e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="e.g. 128"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Max Bitrate</label>
                  <input
                    type="number"
                    value={(defaults.maxBitrate as number) || ""}
                    onChange={(e) => update("defaults.maxBitrate", e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="e.g. 320"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
                  />
                </div>
              </div>

              <div className="space-y-3 max-w-md">
                {[
                  { path: "defaults.strictTitle", label: "Strict Title Matching" },
                  { path: "defaults.strictArtist", label: "Strict Artist Matching" },
                  { path: "defaults.strictAlbum", label: "Strict Album Matching" },
                ].map((toggle) => (
                  <label key={toggle.path} className="flex items-center justify-between py-1 cursor-pointer">
                    <span className="text-sm font-medium">{toggle.label}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={!!defaults[toggle.path.split(".")[1]]}
                      onClick={() => update(toggle.path, !defaults[toggle.path.split(".")[1]])}
                      className={cn(
                        "relative h-6 w-10 rounded-full transition-colors",
                        defaults[toggle.path.split(".")[1]] ? "bg-primary" : "bg-border-strong"
                      )}
                    >
                      <span className={cn(
                        "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                        !!defaults[toggle.path.split(".")[1]] && "translate-x-4"
                      )} />
                    </button>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === "search" && (
            <div className="space-y-5">
              <h2 className="font-display font-semibold text-base">Default Search Behavior</h2>
              <div className="space-y-3 max-w-md">
                {[
                  { path: "defaults.fastSearch", label: "Fast Search", desc: "Start downloading when preferred conditions met" },
                  { path: "defaults.desperateMode", label: "Desperate Mode", desc: "Exhaustive search for hard-to-find tracks" },
                  { path: "defaults.artistMaybeWrong", label: "Artist Maybe Wrong", desc: "Search without artist name" },
                  { path: "defaults.removeFt", label: "Remove feat.", desc: "Strip featuring artists from search" },
                  { path: "defaults.ytDlpFallback", label: "yt-dlp Fallback", desc: "Use yt-dlp if track not found on Soulseek" },
                ].map((toggle) => (
                  <label key={toggle.path} className="flex items-center justify-between py-1 cursor-pointer">
                    <div>
                      <p className="text-sm font-medium">{toggle.label}</p>
                      <p className="text-xs text-text-muted">{toggle.desc}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={!!defaults[toggle.path.split(".")[1]]}
                      onClick={() => update(toggle.path, !defaults[toggle.path.split(".")[1]])}
                      className={cn(
                        "relative h-6 w-10 rounded-full transition-colors shrink-0 ml-4",
                        defaults[toggle.path.split(".")[1]] ? "bg-primary" : "bg-border-strong"
                      )}
                    >
                      <span className={cn(
                        "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                        !!defaults[toggle.path.split(".")[1]] && "translate-x-4"
                      )} />
                    </button>
                  </label>
                ))}
              </div>

              <div className="max-w-md space-y-1.5">
                <label className="text-sm font-medium text-text-secondary">Search Timeout (ms)</label>
                <input
                  type="number"
                  value={(defaults.searchTimeout as number) || 6000}
                  onChange={(e) => update("defaults.searchTimeout", parseInt(e.target.value) || 6000)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
                />
              </div>

              <div className="max-w-md space-y-1.5">
                <label className="text-sm font-medium text-text-secondary">Banned Users</label>
                <textarea
                  value={((defaults.bannedUsers as string[]) || []).join(", ")}
                  onChange={(e) => update("defaults.bannedUsers", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                  placeholder="Comma-separated usernames..."
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-light resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === "output" && (
            <div className="space-y-5">
              <h2 className="font-display font-semibold text-base">Output Defaults</h2>
              <div className="max-w-md space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Download Path</label>
                  <input
                    type="text"
                    value={(defaults.downloadPath as string) || ""}
                    onChange={(e) => update("defaults.downloadPath", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Name Format</label>
                  <input
                    type="text"
                    value={(defaults.nameFormat as string) || "{artist} - {title}"}
                    onChange={(e) => update("defaults.nameFormat", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
                  />
                  <p className="text-xs text-text-faint">
                    Variables: {"{artist}"}, {"{title}"}, {"{album}"}, {"{track}"}, {"{year}"}, {"{bitrate}"}, {"{ext}"}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Concurrent Downloads</label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={(defaults.concurrentDownloads as number) || 2}
                    onChange={(e) => update("defaults.concurrentDownloads", parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <p className="text-xs text-text-muted">
                    {(defaults.concurrentDownloads as number) || 2} simultaneous downloads
                  </p>
                </div>

                <label className="flex items-center justify-between py-1 cursor-pointer">
                  <span className="text-sm font-medium">Write Playlist (.m3u)</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!!defaults.writePlaylist}
                    onClick={() => update("defaults.writePlaylist", !defaults.writePlaylist)}
                    className={cn(
                      "relative h-6 w-10 rounded-full transition-colors",
                      defaults.writePlaylist ? "bg-primary" : "bg-border-strong"
                    )}
                  >
                    <span className={cn(
                      "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                      !!defaults.writePlaylist && "translate-x-4"
                    )} />
                  </button>
                </label>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Album Art</label>
                  <div className="flex gap-2">
                    {(["default", "largest", "most"] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => update("defaults.albumArt", opt)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize",
                          defaults.albumArt === opt
                            ? "border-primary bg-primary-light text-primary"
                            : "border-border text-text-muted hover:border-border-strong"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border pt-6 mt-6">
        <AppInfo />
      </div>
    </div>
  );
}

function AppInfo() {
  const [info, setInfo] = useState<{ version?: string; buildDate?: string; database?: string } | null>(null);
  useEffect(() => {
    api.health().then((data: any) => setInfo(data)).catch(() => { });
  }, []);

  if (!info) return null;

  return (
    <div className="text-xs text-text-faint flex gap-4">
      <span>Version: {info.version}</span>
      <span>Built: {info.buildDate}</span>
      <span className={cn(info.database === 'connected' ? 'text-green-500' : 'text-red-500')}>
        DB: {info.database}
      </span>
    </div>
  );
}
