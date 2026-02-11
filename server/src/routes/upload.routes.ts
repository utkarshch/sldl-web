import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { v4 as uuid } from "uuid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, "../../data/uploads");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    cb(null, `${uuid()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".csv" || ext === ".txt") {
      cb(null, true);
    } else {
      cb(new Error("Only .csv and .txt files are allowed"));
    }
  },
});

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function createUploadRoutes(): Router {
  const router = Router();

  router.post("/csv", upload.single("file"), (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    try {
      const content = fs.readFileSync(req.file.path, "utf-8");
      const lines = content.split("\n").filter((l) => l.trim());

      if (lines.length < 2) {
        res.status(400).json({ error: "CSV must have at least a header and one data row" });
        return;
      }

      const columns = parseCsvLine(lines[0]);
      const previewRows = lines.slice(1, 6).map((line) => {
        const values = parseCsvLine(line);
        const row: Record<string, string> = {};
        columns.forEach((col, i) => {
          row[col] = values[i] || "";
        });
        return row;
      });

      const uploadId = path.basename(req.file.path);

      res.json({
        uploadId,
        columns,
        rowCount: lines.length - 1,
        preview: previewRows,
        filePath: req.file.path,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to parse CSV";
      res.status(500).json({ error: message });
    }
  });

  return router;
}
