import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function detectInputType(
  input: string
): "spotify" | "youtube" | "bandcamp" | "musicbrainz" | "soulseek" | "search" {
  const trimmed = input.trim();
  if (/https?:\/\/(open\.)?spotify\.com\/(playlist|album|track|user)\//.test(trimmed))
    return "spotify";
  if (/https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(trimmed))
    return "youtube";
  if (/https?:\/\/.*\.bandcamp\.com\//.test(trimmed)) return "bandcamp";
  if (/https?:\/\/(www\.)?musicbrainz\.org\//.test(trimmed))
    return "musicbrainz";
  if (/^slsk:\/\//.test(trimmed)) return "soulseek";
  return "search";
}

export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function inputTypeLabel(
  type: string
): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    spotify: { label: "Spotify", color: "bg-green-100 text-green-700" },
    youtube: { label: "YouTube", color: "bg-red-100 text-red-700" },
    bandcamp: { label: "Bandcamp", color: "bg-blue-100 text-blue-700" },
    musicbrainz: { label: "MusicBrainz", color: "bg-amber-100 text-amber-700" },
    soulseek: { label: "Soulseek", color: "bg-violet-100 text-violet-700" },
    csv: { label: "CSV", color: "bg-stone-100 text-stone-700" },
    search: { label: "Search", color: "bg-stone-100 text-stone-600" },
    list: { label: "List", color: "bg-stone-100 text-stone-600" },
  };
  return map[type] ?? { label: type, color: "bg-stone-100 text-stone-600" };
}
