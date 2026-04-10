# 🚀 Antigravity Portfolio & Git-Based CMS

A completely unified, production-grade Web Application executing a dynamic Portfolio UI mapped identically to a headless Git-based Content Management System.

Built entirely autonomously on top of React, Vite, Tailwind CSS, and Netlify Servless Functions.

---

## ✨ Features

- **Integrated Digital Garden (Blog):** Reads deeply nested raw markdown via purely statically evaluated endpoints without any rigid database mapping.
- **Git-Based Headless CMS:** Bypass expensive database configurations via an integrated serverless route that commits payload directly onto the `main` GitHub repository branch! 
- **Advanced Filtering Pipeline:** Case-insensitive search mechanics automatically evaluating algorithms prioritizing Titles `(x3)`, Tags `(x2)`, and Content `(x1)`, completely wrapped natively in React `useMemo` hooks.
- **Admin UI Override:** Employs a strict discreet session tracker locking `draft` rendering, manual Admin payload Panels, and a Floating Bot Terminal away from the general public.
- **Optimistic UI Injections:** Mocks GitHub payload completions instantly upon submission, preventing redundant API refetches.
- **Automated Deployments:** Fully tied to GitHub's internal webhook architecture, meaning generating a Post within the website triggers Netlify to instantly rebuild the live repository asynchronously!
- **Zero-Flicker Dark Mode:** A rigorously mounted local storage `prefers-color-scheme` implementation tied globally using React Context wrappers.

---

## 🛠 Tech Stack

- **Framework:** React + Vite (`vite` bundler optimization natively hooked).
- **Styling UI:** Tailwind CSS v3 `class` strategy + Framer Motion animations.
- **Backend Infrastructure:** Netlify Serverless Functions (`@netlify/functions`).
- **REST Communication:** Octokit / GitHub API (`@octokit/rest`).
- **Data Serialization:** Robust local evaluations via `yaml` / `js-yaml`.
- **Typographic Engine:** Markdown mapped via `react-markdown` + `remark-gfm`.

---

## 📁 Project Structure

```bash
📦 shivansh-ai-forge
┣ 📂 netlify
┃ ┗ 📂 functions
┃   ┗ 📜 save-blog.ts           # The Serverless Node securing the GitHub API Rest payload
┣ 📂 src
┃ ┣ 📂 components
┃ ┃ ┣ 📂 blog                   # Granular highly-isolated Chatbot & Filter interfaces
┃ ┃ ┣ 📂 portfolio              # Core App Navigation & Global Layout UI elements
┃ ┃ ┗ 📂 ui                     # Shadcn pre-built interactive layout primitives
┃ ┣ 📂 data
┃ ┃ ┣ 📜 blog.yaml              # The native Storage container acting as the Git CMS Database
┃ ┃ ┗ 📜 portfolio.yaml         # Deep nested structural UI objects mapped to the root page
┃ ┣ 📂 hooks
┃ ┃ ┗ 📜 useTheme.tsx           # Global overarching Dark/Light logic provider context
┃ ┣ 📂 pages                    # App Router index intersections 
┃ ┗ 📜 App.tsx                  # Global Context Wrapping boundaries
┣ 📜 index.html                 # Strict native HTML header mapping anti-flickering payload logic
┗ 📜 tailwind.config.ts         # Central UI rendering configuration node
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

3. **Boot Netlify Local Dev Simulation:**
Always utilize the Netlify wrapper locally to ensure the `.netlify/functions/save-blog` paths map securely without CORS exceptions:
```bash
npx netlify-cli dev
```

---

## 🔐 Environment Variables 

To enable the backend Git-Based CMS locally without tripping authentication blockades, generate an explicit `.env` file in the exact core root of your project:

```bash
GITHUB_TOKEN=github_pat_...
ADMIN_PASSWORD=your_secure_password
```

**Understanding the Keys:**
- `GITHUB_TOKEN`: Produce a Fine-Grained Personal Access Token internally within your GitHub Developer Settings. **It must explicitly allow strict `Repo` (Read & Write) access to your portfolio repository.**
- `ADMIN_PASSWORD`: A completely arbitrary password of your choosing. The frontend verifies this exact string instantly upon submission attempts avoiding local spoofing.

---

## 🌐 Netlify Deployment

Since the architecture natively runs on Netlify, deployment is perfectly seamless:
1. Connect the Repository to the Netlify Dashboard.
2. Under `Site Configuration > Environment Variables`, identically mount your `GITHUB_TOKEN` and `ADMIN_PASSWORD`.
3. Set your Build Command natively as `npm run build` targeting the `dist` payload context directory.
4. Auto-publishing natively registers automatically!

---

## 🧠 Core Execution Flow

The Magic Behind The Curtain:
`User Frontend Entry` → `Discreet Admin Padlock (sessionStorage Auth` → `Post Validation` → `POST Netlify Function Payload (/save-blog)` → `Octokit evaluates SHA/Repo Bounds` → `GitHub Automatically Commits new node to /blog.yaml` → `Hook Triggers Netlify Prod Build Cycle`

---

## 🔒 Security Posture

- The `.env` tracking configuration is structurally bound to `.gitignore`. **NEVER leak your Fine-Grained access token directly onto the active remote.**
- `index.html` implements strict native UI blockers avoiding FOUC (Flash of un-styled content).
- Passwords are strictly verified backend-only (the frontend simply attempts connection and observes the resulting 401 exceptions).
