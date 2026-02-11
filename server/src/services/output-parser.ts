import type { ParsedEvent } from "../types/index.js";

// Strip ANSI escape codes from sldl output
function stripAnsi(str: string): string {
  return str.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ""
  );
}

export function parseLine(rawLine: string): ParsedEvent {
  const line = stripAnsi(rawLine).trim();
  if (!line) return { type: "raw", line: rawLine };

  // Final summary: "Completed: 12 succeeded, 3 failed."
  const summaryMatch = line.match(
    /Completed:\s*(\d+)\s*succeeded,\s*(\d+)\s*failed/i
  );
  if (summaryMatch) {
    return {
      type: "summary",
      succeeded: parseInt(summaryMatch[1], 10),
      failed: parseInt(summaryMatch[2], 10),
    };
  }

  // Searching pattern
  if (line.match(/^Searching\b/i) || line.match(/searching\.{2,}/i)) {
    const trackMatch = line.match(/Searching\s+(.+)/i);
    return {
      type: "searching",
      track: trackMatch ? trackMatch[1].trim() : "unknown",
    };
  }

  // Found results
  const foundMatch = line.match(/^Found\s+result[s]?.*?:\s*(.+)/i);
  if (foundMatch) {
    return {
      type: "found",
      track: foundMatch[1].trim(),
      user: "",
      file: "",
    };
  }

  // Download progress (percentage-based)
  const progressMatch = line.match(/(\d+(?:\.\d+)?)%/);
  if (progressMatch && line.match(/download/i)) {
    return {
      type: "downloading",
      track: line.replace(/\d+(?:\.\d+)?%.*/, "").trim() || "unknown",
      progress: parseFloat(progressMatch[1]),
    };
  }

  // Completed download
  const completedMatch = line.match(
    /(?:Downloaded|Saved|Completed).*?[:\s]+(.+)/i
  );
  if (completedMatch && !summaryMatch) {
    return {
      type: "completed",
      track: completedMatch[1].trim(),
      path: "",
    };
  }

  // Failed download
  const failedMatch = line.match(/(?:Failed|Error|No results).*?[:\s]+(.+)/i);
  if (failedMatch) {
    return {
      type: "failed",
      track: failedMatch[1].trim(),
      reason: line,
    };
  }

  // Skipped
  const skippedMatch = line.match(/(?:Skipped|Already exists).*?[:\s]+(.+)/i);
  if (skippedMatch) {
    return {
      type: "skipped",
      track: skippedMatch[1].trim(),
      reason: line,
    };
  }

  // Info lines (non-empty lines that don't match other patterns)
  if (line.length > 0 && !line.startsWith("[") && !line.startsWith("─")) {
    return { type: "info", message: line };
  }

  return { type: "raw", line: rawLine };
}
