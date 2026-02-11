import { useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn, detectInputType, inputTypeLabel } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { useDownloadStore } from "@/stores/download-store";
import {
  Search,
  Upload,
  FileSpreadsheet,
  ArrowRight,
  Loader2,
  ChevronDown,
  Disc3,
  Library,
  BarChart3,
  Layers,
  X,
} from "lucide-react";
import type { Job, DownloadMode } from "../../../shared/types/index.ts";

const MODES: {
  id: DownloadMode;
  label: string;
  desc: string;
  icon: React.ElementType;
}[] = [
  {
    id: "normal",
    label: "Normal",
    desc: "One file per track",
    icon: Disc3,
  },
  {
    id: "album",
    label: "Album",
    desc: "Download entire folders",
    icon: Library,
  },
  {
    id: "aggregate",
    label: "Aggregate",
    desc: "Distinct songs by artist",
    icon: BarChart3,
  },
  {
    id: "album-aggregate",
    label: "Album Aggregate",
    desc: "Distinct albums by artist",
    icon: Layers,
  },
];

const FORMAT_OPTIONS = ["mp3", "flac", "ogg", "wav", "aac", "opus"];

export function NewDownloadPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill from dashboard quick search
  const prefill = (location.state as { input?: string; inputType?: string }) || {};

  const [input, setInput] = useState(prefill.input || "");
  const [mode, setMode] = useState<DownloadMode>("normal");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvInfo, setCsvInfo] = useState<{
    columns: string[];
    rowCount: number;
    preview: Record<string, string>[];
    uploadId: string;
  } | null>(null);

  // Options
  const [showOptions, setShowOptions] = useState(false);
  const [formats, setFormats] = useState<string[]>(["mp3"]);
  const [minBitrate, setMinBitrate] = useState("");
  const [maxBitrate, setMaxBitrate] = useState("");
  const [fastSearch, setFastSearch] = useState(true);
  const [desperateMode, setDesperateMode] = useState(false);
  const [removeFt, setRemoveFt] = useState(true);
  const [strictTitle, setStrictTitle] = useState(false);
  const [strictArtist, setStrictArtist] = useState(false);

  // CSV column mapping
  const [csvMapping, setCsvMapping] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addJob } = useDownloadStore();

  const detectedType = input ? detectInputType(input) : null;

  const handleCsvUpload = useCallback(async (file: File) => {
    setCsvFile(file);
    try {
      const result = await api.uploadCsv(file);
      setCsvInfo(result);
      // Auto-map common column names
      const autoMap: Record<string, string> = {};
      for (const col of result.columns) {
        const lower = col.toLowerCase();
        if (lower.includes("artist")) autoMap.artistCol = col;
        else if (lower.includes("title") || lower.includes("song") || lower.includes("track"))
          autoMap.titleCol = col;
        else if (lower.includes("album")) autoMap.albumCol = col;
        else if (lower.includes("length") || lower.includes("duration"))
          autoMap.lengthCol = col;
      }
      setCsvMapping(autoMap);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "CSV upload failed");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith(".csv") || file.name.endsWith(".txt"))) {
        handleCsvUpload(file);
      }
    },
    [handleCsvUpload]
  );

  const toggleFormat = (f: string) => {
    setFormats((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const handleSubmit = async () => {
    const finalInput = csvInfo ? csvInfo.uploadId : input;
    if (!finalInput.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const flags: Record<string, string | boolean | number> = {};
    if (formats.length > 0) flags["format"] = formats.join(",");
    if (minBitrate) flags["min-bitrate"] = parseInt(minBitrate, 10);
    if (maxBitrate) flags["max-bitrate"] = parseInt(maxBitrate, 10);
    if (fastSearch) flags["fast-search"] = true;
    if (desperateMode) flags["desperate"] = true;
    if (removeFt) flags["remove-ft"] = true;
    if (strictTitle) flags["strict-title"] = true;
    if (strictArtist) flags["strict-artist"] = true;

    // CSV mapping flags
    if (csvInfo) {
      if (csvMapping.artistCol) flags["artist-col"] = csvMapping.artistCol;
      if (csvMapping.titleCol) flags["title-col"] = csvMapping.titleCol;
      if (csvMapping.albumCol) flags["album-col"] = csvMapping.albumCol;
      if (csvMapping.lengthCol) flags["length-col"] = csvMapping.lengthCol;
    }

    try {
      const job = (await api.createDownload({
        input: finalInput,
        inputType: csvInfo ? "csv" : detectedType || "search",
        downloadMode: mode,
        flags,
      })) as unknown as Job;

      addJob(job);
      navigate(`/downloads/${job.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create download");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-display font-bold text-3xl tracking-tight">
          New Download
        </h1>
        <p className="text-text-muted mt-1">
          Search, paste a URL, or upload a CSV file.
        </p>
      </div>

      {/* Input Section */}
      <div className="rounded-xl bg-surface border border-border shadow-sm p-6 space-y-5">
        <h2 className="font-display font-semibold text-base">Input</h2>

        {/* Search / URL input */}
        <div className="relative">
          <div className="flex items-center rounded-lg border border-border bg-background overflow-hidden transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-light">
            <Search className="h-4 w-4 text-text-faint ml-3.5" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search query, Spotify URL, YouTube URL, Bandcamp URL..."
              className="flex-1 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-text-faint"
            />
            {detectedType && (
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium mr-3 shrink-0",
                  inputTypeLabel(detectedType).color
                )}
              >
                {inputTypeLabel(detectedType).label}
              </span>
            )}
          </div>
        </div>

        {/* CSV Drop Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={cn(
            "rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
            csvFile
              ? "border-accent bg-accent-light/30"
              : "border-border hover:border-primary-hover hover:bg-primary-light/30"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleCsvUpload(file);
            }}
          />
          {csvFile ? (
            <div className="flex items-center justify-center gap-3">
              <FileSpreadsheet className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">{csvFile.name}</span>
              <span className="text-xs text-text-muted">
                ({csvInfo?.rowCount ?? 0} rows)
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCsvFile(null);
                  setCsvInfo(null);
                }}
                className="ml-2 p-1 rounded-md hover:bg-surface-hover"
              >
                <X className="h-3.5 w-3.5 text-text-muted" />
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Upload className="h-5 w-5 text-text-faint mx-auto" />
              <p className="text-sm text-text-muted">
                Drop a CSV or TXT file here, or click to browse
              </p>
            </div>
          )}
        </div>

        {/* CSV Column Mapping */}
        {csvInfo && (
          <div className="space-y-3 p-4 rounded-lg bg-background border border-border">
            <h3 className="text-sm font-medium">Map Columns</h3>
            <div className="grid grid-cols-2 gap-3">
              {["artistCol", "titleCol", "albumCol", "lengthCol"].map(
                (field) => (
                  <div key={field} className="space-y-1">
                    <label className="text-xs text-text-muted capitalize">
                      {field.replace("Col", "")}
                    </label>
                    <select
                      value={csvMapping[field] || ""}
                      onChange={(e) =>
                        setCsvMapping((m) => ({
                          ...m,
                          [field]: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-primary"
                    >
                      <option value="">— None —</option>
                      {csvInfo.columns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              )}
            </div>

            {/* Preview */}
            {csvInfo.preview.length > 0 && (
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      {csvInfo.columns.map((col) => (
                        <th
                          key={col}
                          className="text-left py-1.5 px-2 text-text-muted font-medium"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvInfo.preview.map((row, i) => (
                      <tr key={i} className="border-b border-border/50">
                        {csvInfo.columns.map((col) => (
                          <td key={col} className="py-1.5 px-2 truncate max-w-[150px]">
                            {row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mode Selection */}
      <div className="rounded-xl bg-surface border border-border shadow-sm p-6 space-y-4">
        <h2 className="font-display font-semibold text-base">Download Mode</h2>
        <div className="grid grid-cols-2 gap-3">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-150",
                mode === m.id
                  ? "border-primary bg-primary-light shadow-sm"
                  : "border-border hover:border-border-strong hover:shadow-sm"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  mode === m.id
                    ? "bg-primary text-white"
                    : "bg-surface-hover text-text-muted"
                )}
              >
                <m.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-sm">{m.label}</p>
                <p className="text-xs text-text-muted mt-0.5">{m.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Options (collapsible) */}
      <div className="rounded-xl bg-surface border border-border shadow-sm overflow-hidden">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="w-full flex items-center justify-between p-6 text-left"
        >
          <h2 className="font-display font-semibold text-base">Options</h2>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-text-muted transition-transform",
              showOptions && "rotate-180"
            )}
          />
        </button>

        {showOptions && (
          <div className="px-6 pb-6 space-y-6 border-t border-border pt-5">
            {/* Formats */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                Formats
              </label>
              <div className="flex flex-wrap gap-2">
                {FORMAT_OPTIONS.map((f) => (
                  <button
                    key={f}
                    onClick={() => toggleFormat(f)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                      formats.includes(f)
                        ? "border-primary bg-primary-light text-primary"
                        : "border-border text-text-muted hover:border-border-strong"
                    )}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Bitrate range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-secondary">
                  Min Bitrate
                </label>
                <input
                  type="number"
                  value={minBitrate}
                  onChange={(e) => setMinBitrate(e.target.value)}
                  placeholder="e.g. 128"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-secondary">
                  Max Bitrate
                </label>
                <input
                  type="number"
                  value={maxBitrate}
                  onChange={(e) => setMaxBitrate(e.target.value)}
                  placeholder="e.g. 320"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              {[
                { label: "Fast Search", value: fastSearch, set: setFastSearch, desc: "Start downloading when preferred conditions met" },
                { label: "Desperate Mode", value: desperateMode, set: setDesperateMode, desc: "Exhaustive search for hard-to-find tracks" },
                { label: "Remove feat.", value: removeFt, set: setRemoveFt, desc: "Strip featuring artists from search" },
                { label: "Strict Title", value: strictTitle, set: setStrictTitle, desc: "Require exact title match" },
                { label: "Strict Artist", value: strictArtist, set: setStrictArtist, desc: "Require exact artist match" },
              ].map((toggle) => (
                <label
                  key={toggle.label}
                  className="flex items-center justify-between py-1 cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-medium">{toggle.label}</p>
                    <p className="text-xs text-text-muted">{toggle.desc}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={toggle.value}
                    onClick={() => toggle.set(!toggle.value)}
                    className={cn(
                      "relative h-6 w-10 rounded-full transition-colors",
                      toggle.value ? "bg-primary" : "bg-border-strong"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                        toggle.value && "translate-x-4"
                      )}
                    />
                  </button>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive bg-destructive-light rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || (!input.trim() && !csvInfo)}
        className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Starting...
          </>
        ) : (
          <>
            Start Download
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}
