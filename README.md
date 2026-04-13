# 🚀 Shivansh Portfolio — Antigravity CMS

A production-grade, fully autonomous **React + Vite portfolio** backed by a **headless Git-based CMS** running on both **Vercel** and **Netlify**. Every blog post you write from the admin panel is committed directly to GitHub — no database, no backend server, just serverless functions and YAML files.

---
bash scripts/should-deploy.sh-> to turn of auto deploy
## ✨ Features

| Feature | Description |
|---|---|
| 🗂 **Git-Based Headless CMS** | Blog posts are stored as YAML in the repo. The `/api/save-blog` and `/api/delete-blog` routes commit directly to GitHub via Octokit |
| 🤖 **Dual Admin Interfaces** | A draggable + resizable **Admin Matrix Form** and a floating **CMS Chatbot Terminal** — both gated behind session auth |
| ⭐ **Featured & Draft System** | Featured posts get a gold star badge and appear in the filter bar. Draft posts are hidden from public, visible only to admins |
| 🗑 **In-Card Delete** | Inline confirmation overlay on every card (admin-only), commits a deletion to GitHub with `[skip ci]` |
| ⚡ **Optimistic UI** | Posts appear instantly after submit — no page reload needed |
| 🔍 **Smart Search Pipeline** | Weighted scoring: Title `×3`, Tags `×2`, Content `×1` — all inside React `useMemo` |
| 🚫 **Rate Limiting** | Enforces a 30-second cooldown between commits using the GitHub Commits API |
| 🔁 **Cross-Platform API** | Identical `/api/*` routes work on **Vercel natively** and **Netlify via redirects** — zero frontend changes needed |
| 🚢 **Smart Deploy Skip** | `scripts/should-deploy.sh` tells Vercel to skip rebuilds for CMS-only commits (e.g. blog.yaml changes with `[skip ci]`) |
| 🌙 **Zero-Flicker Dark Mode** | `localStorage` + `prefers-color-scheme` via React Context, resolved before first paint |
| 📐 **Draggable + Resizable Panel** | Admin form uses native Pointer Events with direct DOM mutation — butter-smooth, zero React re-renders during drag |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + Vite 5 |
| **Styling** | Tailwind CSS v3 + Framer Motion |
| **Serverless (Vercel)** | `@vercel/node` + `/api` directory |
| **Serverless (Netlify)** | `@netlify/functions` + `/netlify/functions` directory |
| **GitHub Integration** | `@octokit/rest` |
| **Data Layer** | `blog.yaml` + `portfolio.yaml` (no database) |
| **Markdown** | `react-markdown` + `remark-gfm` |
| **AI Chatbot** | Google Gemini API (via `chatService.ts`) |
| **Type Safety** | TypeScript 5 throughout |

---

## 📁 Project Structure

```
📦 shivansh-ai-forge
┣ 📂 api/                          # Vercel serverless adapters (thin shims)
┃ ┣ 📜 save-blog.ts                → calls coreSaveBlog()
┃ ┗ 📜 delete-blog.ts              → calls coreDeleteBlog()
┣ 📂 netlify/functions/            # Netlify serverless adapters (identical contract)
┃ ┣ 📜 save-blog.ts                → calls coreSaveBlog()
┃ ┗ 📜 delete-blog.ts              → calls coreDeleteBlog()
┣ 📂 scripts/
┃ ┗ 📜 should-deploy.sh            # Vercel ignored build step — skips [skip ci] commits
┣ 📂 src/
┃ ┣ 📂 components/
┃ ┃ ┣ 📂 blog/                     # Admin Panel, Chatbot, Filter, BlogCard, BlogModal
┃ ┃ ┣ 📂 portfolio/                # Navbar, ChatAssistant, Projects, TechSphere, etc.
┃ ┃ ┗ 📂 ui/                       # Shadcn/ui primitives
┃ ┣ 📂 data/
┃ ┃ ┣ 📜 blog.yaml                 # CMS database (committed by serverless functions)
┃ ┃ ┗ 📜 portfolio.yaml            # Portfolio content — projects, skills, experience
┃ ┣ 📂 lib/
┃ ┃ ┣ 📜 blog-core.ts              # Shared CMS logic (GitHub, YAML, rate-limit, auth)
┃ ┃ ┗ 📜 apiClient.ts              # Platform-aware fetch utility + route constants
┃ ┣ 📂 hooks/                      # useTheme, useProjectFilter, etc.
┃ ┣ 📂 pages/                      # Blog.tsx, AllProjects.tsx, Index.tsx
┃ ┣ 📂 services/                   # chatService.ts (Gemini AI integration)
┃ ┗ 📜 App.tsx                     # Root routing + context boundaries
┣ 📜 vercel.json                   # Vercel routing + ignored build step
┣ 📜 netlify.toml                  # Netlify routing — maps /api/* to /.netlify/functions/*
┗ 📜 vite.config.ts                # Vite config + localApiProxy plugin (local dev)
```

---

## ⚙️ Installation & Setup

### 1. Clone & Install

```bash
git clone https://github.com/Shivanshvyas1729/My_personal_portfolio.git
cd My_personal_portfolio
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Server-side only (Vercel / Netlify functions)
GITHUB_TOKEN=github_pat_...        # Fine-grained PAT with Repo Read+Write
ADMIN_PASSWORD=your_secure_password

# Frontend-accessible (Vite exposes VITE_ prefix)
VITE_ADMIN_PASSWORD=your_secure_password   # Must match ADMIN_PASSWORD
```

> ⚠️ `.env` is in `.gitignore`. **Never commit secrets to the repository.**

### 3. Run Locally

The project ships with a built-in **Vite API proxy plugin** (`localApiProxy`) that intercepts all `/api/*` requests and executes your serverless functions directly inside the Vite dev server — **no Vercel CLI or Netlify CLI required**.

```bash
npm run dev
```

Your app will be live at `http://localhost:8080` with full API support.

---

## 🔐 Environment Variable Reference

| Variable | Where Used | Purpose |
|---|---|---|
| `GITHUB_TOKEN` | Server (Vercel/Netlify) | Octokit auth — Read + Write access to repo |
| `ADMIN_PASSWORD` | Server (Vercel/Netlify) | Backend password verification |
| `VITE_ADMIN_PASSWORD` | Frontend (Vite) | Used by AdminPanel to send auth with requests |

---

## 🌐 Deploying to Vercel

1. Connect repository to [Vercel Dashboard](https://vercel.com/dashboard)
2. **Settings → Environment Variables → Add:**
   - `GITHUB_TOKEN`
   - `ADMIN_PASSWORD`
   - `VITE_ADMIN_PASSWORD`
3. Build command: `npm run build` | Output: `dist`
4. CMS commits (`[skip ci]`) are automatically ignored by `scripts/should-deploy.sh`

---

## 🌐 Deploying to Netlify

1. Connect repository to [Netlify Dashboard](https://app.netlify.com/)
2. **Site Settings → Environment Variables → Add:**
   - `GITHUB_TOKEN`
   - `ADMIN_PASSWORD`
   - `VITE_ADMIN_PASSWORD`
3. Build command: `npm run build` | Publish directory: `dist`
4. `netlify.toml` is auto-detected — no manual config needed

> **How it works:** `netlify.toml` redirects `/api/save-blog` → `/.netlify/functions/save-blog`, so your frontend uses identical `/api/*` URLs on both platforms.

---

## 🧠 CMS Flow

```
Admin unlocks session (padlock icon, bottom-left)
  → Enters password → POST /api/save-blog (auth ping)
  → 400 response = auth OK (no blog data provided)

Admin submits post (Form or Chatbot):
  → POST /api/save-blog or /api/delete-blog
  → blog-core.ts: auth → rate-limit → fetchYaml → parse → mutate → commit
  → GitHub commit with [skip ci] → no rebuild triggered
  → Optimistic UI update in React state
```

---

## 👨‍💻 Admin Usage Guide

1. Go to `/blog` in your browser
2. Click the 🔒 padlock icon (bottom-left corner)
3. Enter your `ADMIN_PASSWORD`
4. Two admin tools appear:
   - **Admin Matrix Panel** — Draggable + resizable floating form. Grab the header to move it, drag edges/corners to resize.
   - **CMS Chatbot** — Floating bot icon (bottom-right). Step-by-step guided post creation.
5. Each post card now shows a 🗑 delete button (admin-only) with an in-card confirmation overlay
6. **Featured** ⭐ — Post gets a gold badge and appears in the "★ Featured" filter
7. **Draft** 🔒 — Post is hidden from public, visible only when admin is logged in

---

## 🔒 Security Posture

- Environment secrets are **never exposed to the browser** — `GITHUB_TOKEN` and `ADMIN_PASSWORD` live only in serverless function scope
- `VITE_ADMIN_PASSWORD` is only used to form the request body — the real verification happens server-side
- Admin session uses `sessionStorage` with a 60-minute expiry timeout
- All API routes return clean JSON errors — no stack traces exposed to the client
- `blog.yaml` is committed via Octokit with SHA-collision protection — concurrent writes are safely rejected

---

## 🔧 Key Scripts

```bash
npm run dev        # Start local dev server (port 8080) with built-in API proxy
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
npm run test       # Run Vitest unit tests
npm run lint       # ESLint check
```
