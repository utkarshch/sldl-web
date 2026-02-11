# SLDL-Web: Product & Design Requirements Document

*A crate-digging tool for the internet age.*

---

## 1. Product Vision & Philosophy

### What This Is

SLDL-Web is a web interface for the `sldl` command-line music downloader. But calling it a "web interface for a CLI tool" misses the point. That's like calling a turntable "a motor that spins plastic." The CLI is the engine. The web app is the experience.

### The Emotional Experience

The best music software doesn't feel like software. It feels like an instrument, a tool that disappears into the act of creation and discovery. Ableton doesn't feel like Excel for audio. Discogs doesn't feel like Amazon for records. The best tools in music share a quality: **they respect the ritual.**

Downloading music is a ritual for collectors. It's crate-digging -- the digital version of flipping through bins at a record store. The thrill is in the hunt, the discovery, the moment when you find exactly what you were looking for (or something better). SLDL-Web should honor that feeling.

### Design Philosophy

1. **Dark canvas, warm tones.** Music is made in dark rooms. Studios, clubs, bedrooms at 2 AM. The interface should feel like it belongs in those spaces -- dark backgrounds, warm accent colors, nothing that screams "enterprise SaaS dashboard."

2. **Single surface, not a maze of pages.** The best music tools keep you in flow. You shouldn't need to navigate between five pages to download a playlist. Paste, preview, download -- all visible, all on one surface.

3. **Physical metaphors, not skeuomorphism.** We're not recreating a record player in the browser. But we borrow the *language* of physical media -- crates, discs, labels, grooves -- to create familiarity and warmth.

4. **Opinionated defaults, transparent overrides.** The app should work perfectly with zero configuration for 80% of use cases. Advanced options exist but don't clutter the primary experience.

5. **Taste as a feature.** Every default, every suggestion, every empty state communicates: "This was built by people who care about music." The curated suggestions, the format badge designs, the vocabulary -- all of it signals taste.

### What Makes This Different

Most download tools look like they were designed by people who think of music as "content." Rows in a database. Files to be transferred. SLDL-Web treats music as *music* -- something worth hunting for, something worth organizing, something worth the ritual of discovery.

---

## 2. User Personas

### Persona 1: The DJ / Selector -- "Kofi"

**Who:** Semi-professional DJ who plays at local venues and online streams. Mixes across genres (Afrobeat, house, jazz). Has a Spotify account with 200+ playlists organized by vibe, BPM, and venue.

**Pain points:**
- Needs FLAC files for CDJs; Spotify's streaming quality isn't enough for a club system.
- Currently uses multiple tools (youtube-dl, Soulseek desktop client, manual Bandcamp purchases) to build a library.
- Spends hours manually searching for each track from a Spotify playlist.
- Needs to download 20-50 tracks before each gig, often late at night.

**What SLDL-Web solves:** Paste a Spotify playlist URL, get FLAC files. One action instead of fifty.

**Key flows:** Spotify playlist import, batch download with FLAC preference, download history as a "crate" for gig prep.

### Persona 2: The Collector / Archivist -- "Yuki"

**Who:** Music archivist who maintains a personal library of 50,000+ tracks. Obsessive about metadata, file quality, and organization. Uses MusicBrainz and Discogs for cataloging.

**Pain points:**
- CLI tools are powerful but tedious for large batch operations.
- Maintaining consistent file naming across thousands of downloads.
- Tracking what's already been downloaded vs. what's queued.
- Quality filtering: needs specific bitrate/sample-rate/format combinations.

**What SLDL-Web solves:** CSV upload with column mapping, persistent quality settings, download history, file naming templates.

**Key flows:** CSV batch upload, advanced quality filtering, download history review, settings configuration.

### Persona 3: The Casual Listener -- "Priya"

**Who:** Music enthusiast who discovers songs on TikTok, Instagram, and Spotify. Wants to own the music, not just stream it. Not particularly technical.

**Pain points:**
- Doesn't know what Soulseek is.
- Finds CLI tools intimidating.
- Just wants to type a song name and get the file.
- Doesn't care about FLAC vs. MP3 -- just wants it to work.

**What SLDL-Web solves:** Type a song name, click download. That's it.

**Key flows:** Text search, single-track download, Spotify link paste.

### Persona 4: The Label Runner / Music Blogger -- "Marcus"

**Who:** Runs a small music blog or net-label. Needs to download reference tracks, preview releases, and build curated collections for review.

**Pain points:**
- Needs to download specific albums for review, often from Bandcamp links shared by artists.
- Wants to preview track lists before downloading.
- Needs to organize downloads by project/article.

**What SLDL-Web solves:** Bandcamp URL parsing with album preview, album download mode, organized download history.

**Key flows:** Bandcamp URL import, album preview, album download, history browsing.

---

## 3. Core User Flows

### Flow 1: Search & Download (Single Track)

**Trigger:** User wants to download a specific song.

**Steps:**
1. User lands on the Dashboard. The Command Bar is prominent at the top.
2. User types a search query (e.g., "Khruangbin Maria Tambien") into the Command Bar.
3. The input type is auto-detected as "search" (no URL pattern detected). A subtle "Search" badge appears.
4. User selects download mode (defaults to "Normal" -- single track).
5. User clicks "Download" or presses Enter.
6. A new job card appears in the "Active Downloads" section below the Command Bar.
7. The card shows: searching → found → downloading (with progress bar and disc animation) → completed.
8. On completion, the card shows format badge (e.g., FLAC gold badge), file size, and source user.

**Error path:** If not found on Soulseek, the card shows "Not found" with options: "Retry with Desperate Mode" or "Search Manually."

### Flow 2: CSV Upload & Batch Download

**Trigger:** User has a CSV file with a list of tracks to download.

**Steps:**
1. User drags a CSV file onto the browser window (or clicks the upload icon in the Command Bar).
2. A full-page drop zone overlay appears with a vinyl record icon and "Drop your CSV or TXT file here."
3. On drop, the file is uploaded. The Command Bar area expands to show the CSV panel.
4. Auto-column-detection runs. The panel shows:
   - File name and row count.
   - Column mapping dropdowns (Artist, Title, Album, Duration) with auto-detected values highlighted.
   - A 3-5 row preview table.
5. User reviews/adjusts column mapping.
6. User selects download mode (Normal for individual tracks, Album for full albums).
7. User selects quality preferences (format, bitrate) or uses defaults.
8. User clicks "Start Download."
9. A batch job card appears, showing overall progress (X/Y tracks completed) and the currently downloading track.
10. On completion, the card shows a summary: "142 downloaded | 3 failed | 1 skipped" with a "Retry Failed" button.

**Error paths:**
- Invalid file: "This doesn't look like a CSV file."
- No recognizable columns: Column mapping dropdowns open with no auto-selection; a notice reads "We couldn't auto-detect your columns. Please map them manually."

### Flow 3: Spotify Link Import

**Trigger:** User has a Spotify playlist/album/track URL.

**Steps:**
1. User pastes a Spotify URL into the Command Bar.
2. The input type is instantly detected as "Spotify." A green Spotify badge appears.
3. An equalizer animation appears next to the badge. Text: "Resolving playlist..."
4. After 1-5 seconds, the metadata panel expands below the Command Bar:
   - Playlist/album title.
   - Track count.
   - Track listing (first 5 + "and N more").
   - Album art thumbnail (if available).
5. User can deselect individual tracks (collapsed behind "Edit selection" to reduce visual noise).
6. User selects format/quality preferences.
7. User clicks "Download All."
8. A batch job card appears with per-track progress.

**What sldl handles:** The sldl binary natively supports Spotify URLs via `--spotify-client-id` and `--spotify-client-secret`. The web app sends the URL directly to sldl, which resolves the tracks internally.

**Error paths:**
- Invalid Spotify URL: "This URL doesn't look like a valid Spotify link."
- Spotify credentials not configured: "Connect your Spotify API credentials in Settings to import playlists." with a link to Settings drawer.
- Resolution timeout: "Couldn't resolve this playlist. It may be private or very large."

### Flow 4: Bandcamp / URL Import

**Trigger:** User has a Bandcamp (or other supported) URL.

**Steps:**
1. User pastes a Bandcamp URL into the Command Bar.
2. The input type is detected as "Bandcamp." A teal Bandcamp badge appears.
3. Equalizer animation + "Fetching album info..."
4. Metadata panel expands:
   - Album title and artist.
   - Album art (prominently displayed -- Bandcamp culture is album-art-forward).
   - Track listing with durations.
   - For artist pages: all albums listed with release years and track counts.
5. User selects "Download Album" or individual tracks.
6. Batch job card appears.

**Similar flow for:** YouTube URLs, MusicBrainz URLs, Soulseek direct links (slsk://).

### Flow 5: Download Queue & Progress

**Active Downloads area** (below the Command Bar on the Dashboard):

- Each download is a card with:
  - Disc icon (rotates during download, decelerates on completion).
  - Track/playlist name.
  - Format badge and source info.
  - Progress bar with percentage and speed (MB/s).
  - Context menu: View Details, Cancel, Retry.
- Cards are ordered: running first, then queued, then recently completed.
- The job queue is managed server-side (max concurrent downloads configurable, default 2).
- Queued jobs show a "Queued" state with a static gray disc icon.

### Flow 6: Download History ("Your Crate")

- Accessible via the History page (`/history`).
- Presented as a table with columns: Input, Type (badge), Mode, Status, Tracks (completed/total), Date.
- Rows are clickable -- opens a detail panel showing full output log, per-track results, and metadata.
- Header reads "Your Crate" instead of "History."
- Supports filtering by status, type, and date range.

---

## 4. UI Design Direction

### Mood & Aesthetic

**Reference points:**
- Ableton Live's session view (dark, grid-based, functional beauty)
- Teenage Engineering's product design (warmth in minimalism)
- Discogs' vinyl marketplace (reverence for the physical object)
- Nothing Phone's Glyph Interface (playful use of light and pattern)

**Not this:**
- Generic SaaS dashboards (Stripe, Linear -- too cold)
- Skeuomorphic record players (too kitsch)
- Brutalist web design (too hostile for a music tool)

### Color Palette

**Dark mode only.** The interface lives in the dark.

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#0F0F0E` | Page background -- near-black with warm undertone |
| `--bg-surface` | `#1A1918` | Cards, panels, elevated surfaces |
| `--bg-elevated` | `#252422` | Hover states, secondary surfaces |
| `--bg-input` | `#1E1D1B` | Input fields, text areas |
| `--border-default` | `#2E2C29` | Default borders -- visible but subtle |
| `--border-strong` | `#3D3A36` | Focus borders, active states |
| `--text-primary` | `#F5F0EB` | Primary text -- warm white, not blue-white |
| `--text-secondary` | `#B8B0A6` | Secondary text -- warm gray |
| `--text-muted` | `#857E75` | Muted text -- labels, timestamps |
| `--accent-primary` | `#C084FC` | Primary accent -- soft purple (existing brand evolution) |
| `--accent-primary-dim` | `#A855F7` | Darker purple for hover/active states |
| `--accent-warm` | `#F59E0B` | Warm accent -- FLAC badges, premium indicators |
| `--status-success` | `#4ADE80` | Completed downloads |
| `--status-error` | `#F87171` | Failed downloads |
| `--status-warning` | `#FBBF24` | Warnings, reconnection indicator |
| `--platform-spotify` | `#1DB954` | Spotify badge |
| `--platform-bandcamp` | `#1DA0C3` | Bandcamp badge |
| `--platform-youtube` | `#FF0000` | YouTube badge |

### Typography

| Role | Font | Weight | Size |
|------|------|--------|------|
| Display / Headings | Space Grotesk | 600 (Semi-Bold) | 24-32px |
| Body text | System sans-serif (Inter fallback) | 400 (Regular) | 14-16px |
| Labels / Captions | System sans-serif | 500 (Medium) | 11-13px |
| Monospace (logs, codes) | JetBrains Mono | 400 | 13px |

**Font loading strategy:** Self-hosted, subset to Latin characters only. Total payload ~50KB.

### Layout Philosophy

**Command Bar-centric.** The application revolves around a single input field at the top of the Dashboard -- the Command Bar. Everything flows from it: searches, URL imports, CSV uploads. Below it, active downloads and recent history fill the viewport.

**No sidebar navigation** in the primary view. The Dashboard is the entire app for 90% of interactions. History and Settings are accessible via top-right icons and open as a separate page (History) or a slide-in drawer (Settings).

**Content width:** Max 1200px, centered on wide screens. Generous horizontal padding (24-32px).

**Vertical rhythm:** 8px grid. All spacing is a multiple of 8.

---

## 5. Information Architecture

### Page Structure

```
/ (Dashboard)
├── Command Bar (search, paste URL, upload trigger)
├── Active Downloads (job cards, real-time progress)
├── Recent Downloads (last 10 completed)
└── Empty State (first-run experience with curated suggestions)

/history (Your Crate)
├── Filter controls (status, type, date)
└── Download history table (clickable rows → detail panel)

Settings Drawer (slides in from right, 400px)
├── Soulseek Accounts
├── Integrations (Spotify, YouTube)
├── Quality Defaults
├── Search Behavior
└── Output Settings

/login (Login Page)
└── Google OAuth button
```

### Navigation

- **Logo/brand mark** in the top-left corner. Clicking it always returns to Dashboard.
- **History icon** (archive/crate icon) in the top-right. Opens `/history`.
- **Settings icon** (gear) in the top-right. Opens the Settings drawer.
- **User avatar** in the top-right. Dropdown with account info and sign-out.
- **Keyboard shortcut:** `/` focuses the Command Bar from anywhere. `Esc` closes drawers/panels.

---

## 6. Key UI Components

### 6.1 The Command Bar

The centerpiece of the interface. A large, prominent input field at the top of the Dashboard.

**Anatomy:**
```
+---+------------------------------------------------------+---+---+
| Q |  Search for music or paste a URL...                   | ^ | > |
+---+------------------------------------------------------+---+---+
  |                                                          |   |
  Search icon                                         Upload  Download
  (or detected                                        CSV     button
   platform icon)                                     button
```

**Behavior:**
- Placeholder text cycles through suggestions: "Search for music or paste a URL...", "Try: Khruangbin - Maria Tambien", "Paste a Spotify playlist link..."
- On focus (click or `/` key): border brightens, subtle glow appears, placeholder stops cycling.
- As user types: auto-detects input type (search text, Spotify URL, Bandcamp URL, YouTube URL, etc.) and shows a colored badge inside the input.
- Below the Command Bar: a contextual panel expands based on input type (metadata preview for URLs, column mapping for CSV uploads).

**Download mode toggle** (below the Command Bar):
```
[ Normal | Album | Aggregate ]
```
Defaults to the user's last-used mode. "Album Aggregate" available in an overflow menu.

**Advanced options:** Gear icon opens a popover with format selection (chips: MP3, FLAC, OGG, WAV, AAC, OPUS), bitrate range, and toggle switches (Fast Search, Desperate Mode, etc.). These persist across sessions.

### 6.2 The Download Job Card

Each download is a card in the Active Downloads area.

**Single track card:**
```
+---+-----------------------------------------------------+-------+
| O |  Khruangbin - Maria Tambien                          | [...] |
|   |  FLAC 24-bit  |  via user_coolvinyl  |  12.4 MB      |       |
|   |  [================================-----]  78%  1.2MB/s|       |
+---+-----------------------------------------------------+-------+
  |                                                           |
  Disc icon (state-dependent animation)                       Context menu
```

**Batch / playlist card:**
```
+---+-----------------------------------------------------+-------+
| O |  Today's Top Hits                      Spotify       | [...] |
|   |  34 / 50 tracks  |  12 downloading  |  22 complete   |       |
|   |  [==========================---------]  68%           |       |
|   |  Currently: Sabrina Carpenter - Espresso   42%        |       |
|   |  Issues: 2 tracks not found  [Show]                   |       |
+---+-----------------------------------------------------+-------+
```

**The disc icon (28x28px):**
- Queued: Static, grey outline.
- Searching: Subtle pulse animation, primary color.
- Downloading: Rotates slowly (3s per revolution, like a record), primary color.
- Complete: Decelerates and stops, fills with success color, brief scale-up.
- Failed: Brief shake animation, error color.

### 6.3 The CSV Upload Experience

**Trigger:** Drag-and-drop anywhere on the page, or click the upload icon.

**Drop zone activation:**
1. File dragged over browser → entire page dims to 40% opacity.
2. Large drop target appears centered with vinyl record icon + "Drop your CSV or TXT file here."
3. On drop, the icon does a "catch" animation (scale down then back up).

**Post-upload panel** (expands from Command Bar area):
- File name and row count.
- Column mapping dropdowns with auto-detection indicators.
- 3-5 row preview table.
- Download mode and format selectors.
- "Start Download" button.

### 6.4 The Link Parser / Preview

When a recognized URL is pasted, the parser activates:

1. **Detection** (instant): Input border changes to platform color. Platform badge appears.
2. **Resolution** (1-5s): Equalizer animation (three bouncing bars). "Resolving playlist..."
3. **Resolved**: Metadata panel smoothly expands -- title, platform, track count, track list (first 5 + "and N more"), album art thumbnail.
4. **Ready**: Format/mode selectors visible. "Download All" button. Individual track checkboxes for deselection.

**Spotify-specific:** Show "Download all albums from playlist" toggle for playlist-to-discography workflows.

**Bandcamp-specific:** Album art displayed prominently. Artist pages list all albums with release years and track counts.

### 6.5 Settings Drawer

Slides in from the right, 400px wide, backdrop dims.

**Sections (vertical tabs):**
1. **Soulseek Accounts** -- List with active indicator, add/remove/switch.
2. **Integrations** -- Spotify API credentials, YouTube API key.
3. **Quality Defaults** -- Format chips, bitrate range, strict matching toggles.
4. **Search Behavior** -- Fast Search, Desperate Mode, timeout, banned users, yt-dlp fallback.
5. **Output** -- Download path, name format template (with live preview), concurrent downloads slider, album art preference.

---

## 7. Interaction Design Details

### Micro-interactions

**Command Bar focus:**
- Border brightens from `--border-default` to `--border-strong`.
- Subtle glow (box-shadow with `--accent-primary-dim`).
- Placeholder stops cycling, shows "Search or paste a URL..."

**Input type detection badge:**
- 200ms ease-out fade-in.
- Platform color at 15% opacity background, full opacity text.
- Cross-fade when detected type changes.

**Download initiation:**
- Button press animation (scale to 0.97, back to 1.0).
- Button text → spinner for 200-500ms until server acknowledges.
- New job card slides in from the right, 300ms ease-out.

**Progress bar:**
- CSS transition `duration-500 ease-out` for smooth fills.
- At 100%: brief pulse (scale Y 1.0 → 1.3 → 1.0) before state changes to "Complete."

**Disc icon rotation:**
- Downloading: `animation: spin 3s linear infinite`.
- Complete: Deceleration (ease-out, 800ms), then fills with success color.
- Failed: Shake (translateX +-3px, 3 cycles, 200ms).

**Job card completion:**
- Border glows with success color (200ms fade in, 500ms hold, 300ms fade out).
- If tab not visible: badge counter on browser favicon.

**CSV drop zone:**
- Drag enter: page content → 0.4 opacity (200ms); drop zone fades in (200ms).
- Drop: vinyl icon "catch" animation (scale 1.0 → 0.85 → 1.05 → 1.0, 400ms spring).
- Post-drop: drop zone fades out, CSV panel slides down.

### Hover States

- **Job cards:** Lift (translateY -2px) + border brightens + shadow deepens. 150ms ease-out.
- **Buttons:** Background lightens 10%. Primary buttons darken slightly.
- **Track rows:** Background → `--bg-elevated`. No translateY.
- **Disc icon:** Tooltip on hover: "Downloading from user_coolvinyl at 2.1 MB/s."

### Loading States

**Page load:** Skeleton screens for job cards (pulsing rectangles). Command Bar immediately interactive.

**Metadata resolution:** Equalizer animation (three vertical bars, staggered bouncing). After 5s: "Still working... this playlist is large." On failure: bars drop to minimum height, error message inline.

**Download in progress:** Progress bar + currently downloading track name (real-time via WebSocket) + speed (MB/s).

### Success / Failure Feedback

**Success (single):** Bar → 100% → pulse → disc stops, fills green → card border glows green → browser notification (if enabled).

**Success (batch):** Bar → 100% → summary: "142 downloaded | 3 failed | 1 skipped" → "Retry Failed" button if needed.

**Failure (single):** Bar fills red → disc shakes, shows X → error reason on card → "Retry" and "Search Manually" buttons.

**Failure (batch, partial):** Mixed progress bar (green/red fill) → summary → collapsible "Issues" section → "Retry All Failed" button.

---

## 8. Accessibility & Responsiveness

### Keyboard Navigation

Full keyboard operability required.

**Tab order:**
1. Command Bar input
2. Upload button
3. Download mode toggle
4. Settings button
5. Active download cards (Enter opens detail)
6. Queue items
7. Recent items

**Focus indicators:** 2px solid `--accent-primary` with 2px offset, using `:focus-visible`.

### Screen Reader Support

- All icons: `aria-label` attributes.
- Job cards: `role="article"` with descriptive `aria-label` (e.g., "Download job: Khruangbin - Maria Tambien, status: downloading, 67% complete").
- Progress bars: `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.
- Command Bar: `role="search"`, input `aria-label="Search for music or paste a URL"`.
- Live regions: `aria-live="polite"` for download completions/failures.
- CSV column mapping: `<fieldset>` + `<legend>`.

### Motion Sensitivity

All animations respect `prefers-reduced-motion`:
- Disc icons: static "in progress" indicator (blinking dot) instead of rotation.
- Progress bars: no pulse at 100%, just color change.
- Cards: no lift on hover, only border/shadow change.
- Equalizer: three static dots with opacity pulse.

### Color Contrast (WCAG AA)

| Combination | Ratio | Grade |
|-------------|-------|-------|
| `--text-primary` on `--bg-primary` | ~17:1 | AAA |
| `--text-secondary` on `--bg-surface` | ~7.5:1 | AA |
| `--text-muted` on `--bg-surface` | ~4.5:1 | AA |

Status colors never the sole indicator -- always accompanied by icons and text labels.

### Responsive Breakpoints

| Name | Width | Layout |
|------|-------|--------|
| Mobile | < 640px | Single column, stacked |
| Tablet | 640-1024px | Single column, wider cards |
| Desktop | 1024-1440px | Primary layout |
| Wide | > 1440px | Content max-width 1200px, centered |

**Mobile adaptations:**
- Command Bar full width, upload/settings icons below input.
- Download mode → dropdown instead of segmented control.
- Job cards stack vertically, no lift animation.
- CSV preview scrolls horizontally.
- Settings drawer → full-screen bottom sheet.
- Detail panel → full-screen page.
- All tap targets minimum 44x44px.
- Swipe left on job cards: cancel/retry.
- Long-press: context menu.

---

## 9. Differentiators & Delight Moments

### The "Paste and Watch" Moment

When a user pastes a Spotify or Bandcamp URL, the transition from "raw URL text" to "resolved playlist with album art and track listing" should feel like watching a Polaroid develop. Metadata materializes piece by piece: first the title, then the track count, then the track listing fills in row by row (staggered, 50ms per row). This transforms a utilitarian action into a small moment of revelation.

### The Disc Iconography

The vinyl disc is the central visual metaphor. Every download has a disc. The disc rotates while downloading (at a 3-second rotation cycle -- a nod to 33 1/3 RPM). When complete, it decelerates and stops, like a turntable powering down. This is a small thing, but it's the kind of detail that makes users feel the tool was built by someone who cares about music, not by someone who cares about shipping features.

### The First-Run Experience

On first visit (no downloads yet), the empty state is not a sad empty illustration:

```
+-----------------------------------------------------------+
|                                                             |
|     The crate is empty.                                     |
|                                                             |
|     Start by pasting a Spotify link, searching for          |
|     a track, or dropping a CSV file.                        |
|                                                             |
|     Try one of these:                                       |
|     [Khruangbin - Time (You and I)]  ← clickable,           |
|     [Radiohead - OK Computer]             pre-fills         |
|     [Paste a Spotify playlist URL]        the Command Bar   |
|                                                             |
+-----------------------------------------------------------+
```

The suggestions are curated, musically credible choices -- not "Baby Shark" or "Happy Birthday." They signal: "the people who built this have taste."

### Audio Format Badge Design

Format badges are designed as physical media labels:
- **FLAC:** Gold badge with subtle texture -- suggests premium quality.
- **MP3:** Silver badge -- practical and universal.
- **WAV:** White badge with waveform graphic.
- **OGG/OPUS:** Blue-tinted badge.

### Download Speed as Vinyl RPM

A playful mapping of download speed to RPM:
- Slow (< 500 KB/s): "33 RPM" -- disc rotates slowly.
- Medium (500 KB/s - 2 MB/s): "45 RPM" -- moderate rotation.
- Fast (> 2 MB/s): "78 RPM" -- fast rotation.

Purely cosmetic but creates a conversation point and a sense of identity.

### Sound Effects (Optional, Off by Default)

For users who opt in:
- Download complete: Soft "vinyl crackle" pop.
- Batch complete: Brief chord (like the end of a record side).
- Error: Gentle "needle skip" click.

High-quality audio, not chiptune gimmicks. Think MUJI alarm clock, not mobile game.

### The "Crate" Metaphor

Download history is "Your Crate" -- evoking the milk crate of records every DJ owns. Each batch download is a "stack" within the crate.

### Time-Aware Touches

Dashboard greeting changes with time of day:
- "Late night session?" (after midnight)
- "Morning dig" (before noon)
- "Afternoon crate-digging" (afternoon)
- "Evening session" (evening)

---

## 10. Technical UI Considerations

### Real-time Updates (WebSocket)

Retain existing Socket.io infrastructure. Current events:

```typescript
// Server → Client (existing, keep as-is)
"job:output"        // { jobId, line, parsed, timestamp }
"job:state"         // { jobId, state, progress }
"job:exit"          // { jobId, exitCode, summary }
"dashboard:update"  // { activeJobs, queuedJobs, completedToday, totalDownloaded }
```

**New events to add:**
```typescript
// Server → Client
"job:metadata"  // { jobId, metadata: { title, artist, album, artwork?, trackCount } }
                // Emitted when URL metadata is resolved
"job:track"     // { jobId, trackIndex, state, trackInfo }
                // Per-track status updates within a batch job

// Client → Server
"url:resolve"   // { url }
                // Request URL metadata resolution WITHOUT starting a download
```

**Reconnection:** Re-subscribe to active job rooms. Fetch current state via REST. Show subtle yellow status dot (not a modal/banner).

### Drag-and-Drop

Native HTML5 Drag and Drop API (no library needed). Global drop zone on `document.body`. Debounced `dragleave` to prevent flickering. Rejected file types trigger shake animation.

### Clipboard Monitoring (Optional, Opt-in)

On browser tab focus, read clipboard via `navigator.clipboard.readText()`. If a supported URL pattern is detected, show suggestion in Command Bar: "Paste from clipboard: Spotify playlist detected." Silently disabled if permission not granted.

### Browser Notifications

For batch jobs: request notification permission on start, send notification on complete/fail. Clickable notifications focus the browser tab.

### State Persistence

- **Active jobs:** Fetched from server on load (existing behavior, no change).
- **User preferences:** Persist in `localStorage`, sync to server settings.
- **Command Bar history:** Last 20 queries in `localStorage`, shown as suggestions.
- **CSV column mapping:** Stored in `localStorage` by column name set, auto-applied on repeat uploads.

### Performance

- **Large track lists (100+):** Virtualize with `@tanstack/react-virtual`.
- **WebSocket throttling:** Buffer messages, process in `requestAnimationFrame`. Progress UI updates max every 100ms.
- **Album art:** Lazy load, 64x64px in lists, 256x256px in detail. `loading="lazy"` + `IntersectionObserver`.

### Data Type Additions

```typescript
// Add to existing Job type:
metadata?: {
  title?: string;
  artist?: string;
  album?: string;
  artworkUrl?: string;
  trackCount?: number;
  platform?: InputType;
  sourceUrl?: string;
};
tracks?: TrackResult[];

// New types:
interface TrackResult {
  index: number;
  artist: string;
  title: string;
  album?: string;
  state: "pending" | "searching" | "found" | "downloading" | "complete" | "failed" | "skipped";
  source?: { user: string; file: string; format: string; bitrate?: number; size?: number };
  error?: string;
  progress?: number;
}

interface UrlPreview {
  url: string;
  platform: InputType;
  title: string;
  artworkUrl?: string;
  tracks: { artist: string; title: string; album?: string; duration?: number }[];
  totalTracks: number;
}
```

---

## Appendix: Current vs. Proposed Architecture

| Aspect | Current | Proposed |
|--------|---------|----------|
| Navigation | 4-page sidebar (Dashboard, New Download, History, Settings) | Command Bar-centric single page + History page + slide-in drawers |
| Theme | Light mode with dot-grid background | Dark mode only, warm stone tones |
| Color primary | Purple `#6D28D9` | Purple `#C084FC` (lighter for dark bg contrast) |
| Input experience | Separate page (`/new`) with form sections | Inline Command Bar on Dashboard, expandable panels |
| Typography | Satoshi | Space Grotesk (display) + system sans (body) + JetBrains Mono (code) |
| Download progress | Page-level progress bar | Inline card with disc icon, per-track detail |
| URL parsing | Badge appears, no preview | Full metadata resolution with track list preview |
| CSV upload | Separate section on New Download page | Drag-anywhere + inline expansion from Command Bar |
| Settings | Full page with vertical tabs | Slide-out drawer from right edge |
| Empty state | "No downloads yet" text | Curated music suggestions + "The crate is empty" |
| Mobile | Not specifically addressed | Full responsive design with touch-first adaptations |
| Accessibility | Basic (some ARIA missing) | Full WCAG AA compliance, keyboard nav, screen reader |
| Real-time | WebSocket (job:output, job:state) | + URL resolution events + per-track events |

---

*This document is a living artifact. The design should evolve, but the philosophy -- a crate-digging tool for the internet age -- should remain the North Star.*
