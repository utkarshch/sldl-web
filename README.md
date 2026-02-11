# sldl-web

A full-stack web application for batch music downloading via the Soulseek network, powered by the [sldl](https://github.com/fiso64/slsk-batchdl) CLI tool.

## Features

- **Text Search** — Search and download individual songs or albums
- **CSV Upload** — Batch download from CSV files with automatic column detection
- **Spotify Integration** — Download from Spotify playlists and albums (with "Download All Albums from Playlist" mode)
- **Bandcamp Support** — Download tracks, albums, artist discographies, and wishlists
- **Multi-User** — Google OAuth login with per-user download history
- **Multiple Soulseek Accounts** — Connect and switch between Soulseek accounts
- **Real-time Progress** — Live download progress via WebSocket
- **Quality Filters** — Format, bitrate, sample rate, and strict matching controls

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Zustand, Radix UI
- **Backend**: Express.js, TypeScript, Socket.io
- **Database & Auth**: Supabase (PostgreSQL + Google OAuth + Row Level Security)
- **Download Engine**: sldl binary (Soulseek batch downloader)
- **Deployment**: Vercel (frontend) + Railway (backend)

## Prerequisites

- Node.js 18+
- npm 9+
- A Supabase project ([create one](https://supabase.com/dashboard))
- The `sldl` binary for your platform ([releases](https://github.com/fiso64/slsk-batchdl/releases))

## Setup

### 1. Clone and install dependencies

```bash
git clone https://github.com/<your-username>/sldl-web.git
cd sldl-web
npm install
```

### 2. Configure environment variables

Copy the example files and fill in your values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

See the `.env.example` files for required variables.

### 3. Place the sldl binary

Download the sldl binary for your platform and place it in the project root:

```bash
chmod +x sldl
```

### 4. Start development servers

```bash
npm run dev
```

This starts:
- Backend server on `http://localhost:3001`
- Frontend dev server on `http://localhost:5173`

## Project Structure

```
sldl-web/
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route pages
│   │   ├── stores/      # Zustand state stores
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # API client, WebSocket, utilities
│   └── ...
├── server/          # Express.js backend
│   ├── src/
│   │   ├── routes/      # API route handlers
│   │   ├── services/    # Business logic (sldl runner, settings, etc.)
│   │   ├── auth/        # Supabase auth middleware
│   │   └── websocket/   # Socket.io real-time updates
│   └── data/        # Local data (downloads, uploads)
├── shared/          # Shared TypeScript types
└── sldl             # sldl binary (not committed)
```

## License

Private
