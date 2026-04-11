# 🚀 Antigravity Portfolio & Git-Based CMS


vercel dev --listen 0.0.0.0:3000


A completely unified, production-grade Web Application executing a dynamic Portfolio UI mapped identically to a headless Git-based Content Management System.

Built entirely autonomously on top of React, Vite, Tailwind CSS, and Vercel Serverless Functions.

---

## ✨ Features

- **Integrated Digital Garden (Blog):** Reads deeply nested raw markdown via purely statically evaluated endpoints without any rigid database mapping.
- **Git-Based Headless CMS:** Bypass expensive database configurations via an integrated serverless route that commits payload directly onto the `main` GitHub repository branch! 
- **Advanced Filtering Pipeline:** Case-insensitive search mechanics automatically evaluating algorithms prioritizing Titles `(x3)`, Tags `(x2)`, and Content `(x1)`, completely wrapped natively in React `useMemo` hooks.
- **Admin UI Override:** Employs a strict discreet session tracker locking `draft` rendering, manual Admin payload Panels, and a Floating Bot Terminal away from the general public.
- **Optimistic UI Injections:** Mocks GitHub payload completions instantly upon submission, preventing redundant API refetches.
- **Automated Deployments:** Fully tied to GitHub's internal webhook architecture, meaning generating a Post within the website triggers Vercel to instantly rebuild the live repository asynchronously!
- **Zero-Flicker Dark Mode:** A rigorously mounted local storage `prefers-color-scheme` implementation tied globally using React Context wrappers.

---

## 🛠 Tech Stack

- **Framework:** React + Vite (`vite` bundler optimization natively hooked).
- **Styling UI:** Tailwind CSS v3 `class` strategy + Framer Motion animations.
- **Backend Infrastructure:** Vercel Serverless Functions (`/api` directory).
- **REST Communication:** Octokit / GitHub API (`@octokit/rest`).
- **Data Serialization:** Robust local evaluations via `yaml` / `js-yaml`.
- **Typographic Engine:** Markdown mapped via `react-markdown` + `remark-gfm`.

---

## 📁 Project Structure

```bash
📦 shivansh-ai-forge
┣ 📂 api
┃ ┗ 📜 save-blog.ts              # Vercel Serverless Function — GitHub CMS API endpoint
┣ 📂 src
┃ ┣ 📂 components
┃ ┃ ┣ 📂 blog                    # Granular highly-isolated Chatbot & Filter interfaces
┃ ┃ ┣ 📂 portfolio               # Core App Navigation & Global Layout UI elements
┃ ┃ ┗ 📂 ui                      # Shadcn pre-built interactive layout primitives
┃ ┣ 📂 data
┃ ┃ ┣ 📜 blog.yaml               # The native Storage container acting as the Git CMS Database
┃ ┃ ┗ 📜 portfolio.yaml          # Deep nested structural UI objects mapped to the root page
┃ ┣ 📂 hooks
┃ ┃ ┗ 📜 useTheme.tsx            # Global overarching Dark/Light logic provider context
┃ ┣ 📂 pages                     # App Router index intersections 
┃ ┗ 📜 App.tsx                   # Global Context Wrapping boundaries
┣ 📜 vercel.json                  # Vercel deployment & rewrite configuration
┣ 📜 index.html                   # Strict native HTML header mapping anti-flickering payload logic
┗ 📜 tailwind.config.ts           # Central UI rendering configuration node
```

---

## ⚙️ Installation & Setup

1. **Clone the remote repository:**
```bash
git clone https://github.com/Shivanshvyas1729/My_personal_portfolio.git
cd My_personal_portfolio
```

2. **Install Local Dependencies:**
```bash
npm install
```

3. **Boot Vercel Local Dev Server:**
Use the Vercel CLI locally to ensure `/api/save-blog` routes map correctly:
```bash
npx vercel dev
```

Or for frontend-only development:
```bash
npm run dev
```

---

## 🔐 Environment Variables 

Create a `.env` file in the project root:

```bash
GITHUB_TOKEN=github_pat_...
ADMIN_PASSWORD=your_secure_password
```

**Understanding the Keys:**
- `GITHUB_TOKEN`: Generate a Fine-Grained Personal Access Token from your GitHub Developer Settings. **It must explicitly allow `Repo` (Read & Write) access to your portfolio repository.**
- `ADMIN_PASSWORD`: An arbitrary password of your choosing. The backend verifies this string upon every API submission.

> ⚠️ Your `.env` file is already included in `.gitignore`. Never commit secrets to the repository.

---

## 🌐 Vercel Deployment

1. Connect the Repository to the [Vercel Dashboard](https://vercel.com/dashboard).
2. Under **Settings → Environment Variables**, add `GITHUB_TOKEN` and `ADMIN_PASSWORD`.
3. Build command: `npm run build` → Output directory: `dist` (auto-detected by Vercel).
4. Every push to `main` triggers an automatic production deployment.

---

## 🧠 Core Execution Flow

```
User Frontend → Discreet Admin Padlock (sessionStorage Auth)
→ Post Validation → POST /api/save-blog
→ Octokit evaluates SHA/Repo Bounds
→ GitHub Commits new entry to /blog.yaml
→ Webhook Triggers Vercel Production Build
```

---

## 👨‍💻 Usage

1. Run the project locally with `npx vercel dev` or `npm run dev`.
2. Navigate to `/blog` and click the 🔒 lock icon (bottom-left).
3. Enter your admin password to unlock the Admin Panel and Chatbot.
4. Create a blog post via the sidebar form or the floating chatbot.
5. The post is committed to GitHub and auto-deployed to production.

---

## 🔒 Security Posture

- The `.env` file is structurally bound to `.gitignore`. **Never leak your access token onto the remote.**
- `GITHUB_TOKEN` and `ADMIN_PASSWORD` are only accessed server-side inside `/api/save-blog.ts`.
- `index.html` implements strict native UI blockers avoiding FOUC (Flash of Unstyled Content).
- Passwords are verified backend-only — the frontend simply observes the resulting HTTP status codes.
