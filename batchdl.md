# SLDL Batch Download Guide

This guide covers how to use `sldl` for batch downloads, with a focus on CSV files and Album downloads.

## 1. Quick Start

### Basic Commands
```bash
# Download a single song
./sldl "Artist - Song Title"

# Download an album (search)
./sldl "Artist - Album Title" --album

# Download from CSV
./sldl songs.csv
```

### Web Interface
1. Start the server: `cd server && npm start`
2. Start the client: `cd client && npm run dev`
3. Open `http://localhost:5173`

---

## 2. CSV Downloads

SLDL supports downloading lists of songs or albums from CSV files.

### 2.1 File Format
A standard CSV file with headers is recommended. Common headers are automatically detected:
- **Artist** (or "artist")
- **Title** (or "Song", "Track")
- **Album** (or "album")
- **Length** (or "Duration")

**Example CSV (`songs.csv`):**
```csv
Artist,Title,Album,Length
Pink Floyd,Comfortably Numb,The Wall,6:23
The Beatles,Here Comes The Sun,Abbey Road,3:05
```

### 2.2 Downloading Individual Tracks
By default, providing a CSV file downloads the individual tracks listed in it.

**Command:**
```bash
./sldl songs.csv
```

**Web UI:**
1. Select **"Normal"** download mode.
2. Upload your CSV file.
3. Map columns if not auto-detected.
4. Click "Start Download".

### 2.3 Downloading Complete Albums
To download the *entire album* associated with each row in your CSV, use **Album Mode**.

**Command:**
```bash
./sldl songs.csv --album
```
*Note: This works even if the CSV contains track titles. The `--album` flag forces album download mode.*

**Alternative CSV Format (Implicit Album Mode):**
If you leave the **Title** column empty, `sldl` automatically treats the row as an album download, even without the `--album` flag.

**Example Album CSV (`albums.csv`):**
```csv
Artist,Title,Album
Pink Floyd,,The Wall
The Beatles,,Abbey Road
```

**Web UI:**
1. Select **"Album"** download mode.
2. Upload your CSV file (it can contain track titles).
3. Map the **Album** and **Artist** columns.
4. Click "Start Download".

---

## 3. Download Modes

| Mode | Flag | Description |
|------|------|-------------|
| **Normal** | (default) | Downloads individual tracks found in search or CSV. |
| **Album** | `--album` | Downloads the entire folder (album) for the matched result. |
| **Aggregate** | `--aggregate` | Downloads all distinct songs matching the artist/title. |
| **Album Aggregate** | `--album --aggregate` | Downloads all distinct albums matching the artist. |

---

## 4. Advanced Options

### Column Mapping
If your CSV has non-standard headers, map them explicitly:
```bash
./sldl list.csv --artist-col "Performer" --title-col "Name" --album-col "Release"
```

### File Conditions
Filter results to ensure quality:
```bash
./sldl list.csv --min-bitrate 320 --format flac,mp3
```

### Previewing
See what would be downloaded without actually downloading:
```bash
./sldl list.csv --print tracks
```

---

## 5. Troubleshooting

**"No results found"**
- Check your CSV encoding (UTF-8 is best).
- Ensure columns are mapped correctly.
- Try relaxing strict matching (disable `--strict-artist` or `--strict-title`).

**"Job stuck"**
- Check if the binary is running: `ps aux | grep sldl`
- Check server logs: `tail -f server/logs/app.log` (if configured)

**"CSV upload fails in UI"**
- Ensure the file has a `.csv` or `.txt` extension.
- Ensure the file is not empty and has a header row.
