# 🚀 Shivansh Portfolio — Unified CMS Matrix

A production-grade, fully autonomous **React + Vite portfolio** backed by a **Unified Matrix CMS** running on both **Vercel** and **Netlify**. This system features an environment-aware synchronization layer that manages local and cloud deployments with full audit logging.

---

## 🚀 Project Setup & Developer Onboarding

Welcome to the project! This guide will help any developer set up their local environment, run the app, and understand the workflow.

### 1️⃣ Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher (we recommend using [nvm](https://github.com/nvm-sh/nvm))
- **Git**: Installed and configured
- **Package Manager**: `npm` (v9+ recommended)

**Installation Commands:**

*For macOS / Linux:*
```bash
# Install nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Install Node.js 18
nvm install 18
nvm use 18

# Install Git
# Ubuntu/Debian
sudo apt-get install git
# macOS (via Homebrew)
brew install git
```

*For Windows:*
```powershell
# Install nvm-windows via winget
winget install -e --id CoreyButler.NVMforWindows

# Open a new terminal and install Node.js 18
nvm install 18.0.0
nvm use 18.0.0

# Install Git via winget
winget install --id Git.Git -e --source winget
```

### 2️⃣ Clone & Setup

Clone the repository and install the dependencies:

```bash
# Clone the repository
git clone https://github.com/Shivanshvyas1729/My_personal_portfolio.git

# Navigate into the project directory
cd shivansh-ai-forge

# Install dependencies
npm install
```

### 3️⃣ Environment Variables

This project uses environment variables to securely handle API keys and passwords. **Secrets should NEVER be committed to version control.**

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in the required values:
   - `GITHUB_TOKEN`: Required for the CMS to sync directly with GitHub in production mode.
   - `ADMIN_PASSWORD`, `EDITOR_PASSWORD`, `BLOG_PASSWORD`, `SECRET_PASSWORD`: Passwords for accessing the CMS and restricted areas.
   - `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAIL_API_KEY`: Keys for the contact form functionality.

### 4️⃣ Running the Project

Once dependencies are installed and the `.env` file is configured, you can start the development server.

```bash
# Start development server
npm run dev
```
Open your browser and navigate to **[http://localhost:5173](http://localhost:5173)**or   ➜  Local:   http://localhost:8080/
  ➜  Network: http://192.168.56.1:8080/
  ➜  Network: http://10.87.108.146:8080/.

**Production Build:**
If you want to test the production build locally:
```bash
npm run build
npm run preview
```

### 5️⃣ Common Issues & Troubleshooting

- **Node version mismatch:** If you encounter `npm install` errors, ensure you are using Node 18+. Run `node -v` to verify.
- **Port already in use:** Vite uses port `5173` by default. If taken, it will automatically use the next available port (e.g., `5174`).
- **Missing environment variables:** If CMS features or contact forms fail, double-check that your `.env` contains all keys from `.env.example`.
- **Corrupted dependencies:** If the app behaves weirdly or fails to start, try resetting `node_modules`:
  ```bash
  rm -rf node_modules
  npm cache clean --force
  npm install
  ```

### 6️⃣ Git Workflow

We follow a structured branching model.

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: added an awesome new feature"
   ```
3. **Push and open a PR:**
   ```bash
   git push origin feature/your-feature-name
   ```

### 7️⃣ Recommended VS Code Extensions

For the best development experience, install these extensions in VS Code:
- 🛠 **ESLint** (`dbaeumer.vscode-eslint`)
- 💅 **Prettier** (`esbenp.prettier-vscode`)
- 🎨 **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)

### 8️⃣ Useful Commands Overview

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server. |
| `npm run build` | Builds the React app for production to the `dist` folder. |
| `npm run preview` | Locally previews the production build. |
| `npm run lint` | Runs ESLint to check for code quality issues. |
| `npm run test` | Runs the Vitest suite for testing. |

---

## 🔑 GitHub Personal Access Token Setup

This project requires a GitHub Personal Access Token (PAT) to allow the CMS to read and write directly to your repository in production.

### Step-by-Step Guide

1. Open GitHub and log in to your account.
2. Go to: **Settings** → **Developer Settings** → **Personal Access Tokens** → **Tokens (classic)**
3. Click on the **"Generate new token"** button (select *Generate new token (classic)*).
4. Give your token a descriptive name (e.g., `Portfolio CMS Token`) and set an expiration date (or leave it as *No expiration* for convenience, though rotation is more secure).
5. Select the following scopes (permissions):
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
   - Make sure you have **read/write** permissions enabled.
6. Click **Generate token**.
7. **Copy and save the token securely.** GitHub will never show it to you again.
8. **⚠️ SECURITY WARNING:** Never commit this token to version control (GitHub). If you do, GitHub will automatically revoke it.

### Adding Token to Environment

Add your newly generated token to your `.env` file:

```env
GITHUB_TOKEN=your_github_token
```

### Authentication & Usage

- **For pushing code:** You can use this token as your password when using `git remote` operations over HTTPS.
- **GitHub CLI:** Authenticate via `gh auth login` and provide your token when prompted.
- **Revoking/Regenerating:** If your token is ever compromised, immediately return to the Developer Settings page, click **Delete** next to the token, and generate a new one. Update your `.env` and Vercel/Netlify environment variables with the new token.

---

## 📧 EmailJS Complete Setup Guide

The portfolio uses EmailJS to securely handle contact form submissions without needing a backend server. 

### 1. Account & Service Setup

1. Go to [EmailJS.com](https://www.emailjs.com/) and create a free account.
2. Navigate to **Email Services** and click **Add New Service**.
3. Select your email provider (e.g., Gmail), connect your account, and authorize EmailJS to send emails on your behalf.
4. Copy the **Service ID** (this is your `EMAILJS_SERVICE_ID`).

### 2. Environment Variables Setup

You'll need three keys from EmailJS. Add them to your `.env.example` and `.env` files:

```env
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAIL_API_KEY=your_public_key
```
*(Your `EMAIL_API_KEY` is your "Public Key" found under **Account** → **API Keys**).*

### 3. EmailJS Templates

You will need to create an email template. Go to **Email Templates** -> **Create New Template**.

Below are the **Incoming Contact Email** templates you should paste into the EmailJS template editor. Make sure you use the variables exactly as written.

#### Incoming Contact Email (For You)

**Plain Text Version:**
```text
Hello,

You received a new message from {{name}}.

📧 Email: {{email}}
🕒 Time: {{time}}

---

👤 Name: {{name}}
💬 Message:
{{message}}

---

Best regards,
Shivansh Vyas
```

**HTML Version:**
Check the "Enable HTML" toggle in EmailJS and use this:
```html
<div style="font-family: Arial, sans-serif; background: #f6f7fb; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 25px; border-radius: 10px;">
    <p>Hello,</p>
    <p>You received a new message from {{name}}.</p>

    <p>
      📧 Email: {{email}} <br>
      🕒 Time: {{time}}
    </p>

    <p>----------------------------</p>

    <p>
      👤 Name: {{name}} <br>
      💬 Message:<br>
      {{message}}
    </p>

    <p>----------------------------</p>

    <p>
      Best regards,<br>
      Shivansh Vyas
    </p>
  </div>
</div>
```

#### Auto Reply Template (For the User)

Go back to your Template settings in EmailJS. Click the **Auto-Reply** tab.

**Plain Text Version:**
```text
Thanks for reaching out 👋

Hi {{name}},

Thank you for contacting us. We've received your message and I will get back to you shortly.

Your message:
{{message}}

We usually respond within 24–72 hours.

Best regards,
Shivansh Vyas
```

**HTML Version:**
```html
<div style="font-family: Arial, sans-serif; background: #f6f7fb; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 25px; border-radius: 10px;">

    <h2 style="color: #4f46e5;">
      Thanks for reaching out 👋
    </h2>

    <p>
      Hi <strong>{{name}}</strong>,
    </p>

    <p>
      Thank you for contacting us. We've received your message and I will get back to you shortly.
    </p>

    <div style="margin-top: 15px;">
      <strong>Your message:</strong>

      <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; margin-top: 5px;">
        {{message}}
      </div>
    </div>

    <p style="margin-top: 20px;">
      We usually respond within <strong>24–72 hours</strong>.
    </p>

    <hr>

    <p>
      Best regards,<br>
      <strong>Shivansh Vyas</strong>
    </p>

  </div>
</div>
```

### 4. Connecting Auto-Reply Emails

To ensure both you and the sender receive emails correctly:
1. In your **Incoming Contact Email** template settings, look for the **"Reply To"** field and set it to: `{{email}}`. This allows you to hit "Reply" in your email client and reply directly to the sender.
2. In the **Auto-Reply** tab, ensure the **"To Email"** field is set to: `{{email}}`.
3. Save the template and grab the **Template ID**. This becomes your `EMAILJS_TEMPLATE_ID`.

### 5. Frontend Integration Example

With the variables set, EmailJS handles the submission securely from the frontend:

```javascript
import emailjs from '@emailjs/browser';

const sendEmail = async (formData) => {
  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        time: new Date().toLocaleString(),
      },
      import.meta.env.VITE_EMAIL_API_KEY
    );
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};
```

### 6. Security Best Practices

- **Never hardcode your API keys** in your frontend components. Always use environment variables (`.env`).
- In your EmailJS dashboard, go to **Account** -> **Security** and consider whitelisting your production domain (e.g., `https://yourportfolio.com`) under "Allowed Origins" to prevent unauthorized API requests from other domains.
- Do not expose your private key; only the Public Key (`EMAIL_API_KEY`) should be accessible by the frontend.

---

## ✨ Advanced Features

| Feature | Description |
|---|---|
| 🗂 **Unified Matrix CMS** | A single, powerful dashboard to manage Portfolio sections and Project entries from a central interface. |
| 🛡️ **Audit Logging System** | Real-time tracking of every action (Fetch, Save, Delete) with a dedicated "Logs" tab for performance and security monitoring. |
| 🏠 **Local-First Sync** | Intelligently detects local development environments and saves directly to the filesystem, bypassing the network for zero-latency editing. |
| ☁️ **Cloud Commit Layer** | Production edits are committed directly to GitHub via the Octokit pipeline with SHA-collision protection. |
| 📐 **Dynamic Workspace** | Fully resizable and maximizable dashboard with persistent layouts stored in your local session. |
| 🚦 **Environment Awareness** | Automatically switches between Local and Cloud modes based on hostname detection, with a manual override toggle. |
| 🎭 **Aesthetic Engine** | Site-wide fluid text hover interactions and animated gradients, fully orchestrated via `portfolio.yaml`. |
| 🎬 **Auto-Scroll Reveal** | Global performance-optimized Intersection Observer system for directional text reveal animations. |
| 🧶 **Edge Rope Lights** | Premium viewport-framing animated lighting effect with theme-aware color shifting and glow. |

---

## 📁 Project Structure

```
📦 shivansh-ai-forge
┣ 📂 api/                          # Platform-agnostic serverless API routes
┃ ┣ 📜 cms-load.ts                 → Fetches YAML (Local FS or GitHub)
┃ ┣ 📜 cms-save.ts                 → Persists YAML (Filesystem rename or Git Commit)
┃ ┣ 📜 cms-history.ts              → Retrieves Git commit logs
┃ ┣ 📜 auth.ts                     → Role-based session management
┣ 📂 src/
┃ ┣ 📂 components/
┃ ┃ ┗ 📂 cms/                      → The Unified Admin Dashboard & Schema forms
┃ ┣ 📂 data/
┃ ┃ ┣ 📜 portfolio.yaml            → Core portfolio content
┃ ┃ ┗ 📜 projects.yaml             → Project entries
┃ ┣ 📂 context/
┃ ┃ ┗ 📜 CMSContext.tsx            → Central state: Environment, Mode, and Audit Logs
┃ ┣ 📂 lib/
┃ ┃ ┣ 📜 cms-core.ts               → The "Backend Core": Logic for safe file writes & Git sync
┃ ┃ ┗ 📜 logger.ts                 → Stateful Audit Logger with subscription support
```

---

## 🎨 Aesthetic & Interaction Control

The entire visual feel of the portfolio is managed via `src/data/portfolio.yaml` (Global Settings section).

### Text Hover Interaction
- `textHoverColors`: List of colors for hover state (supports animated gradients).
- `textTransitionSpeed`: Global enter/exit transition timing.
- `textAnimationSpeed`: Cycle speed for multi-color gradients.
- `textGlowIntensity`: Strength of the neon glow on hover.

### Edge Rope Lights
- `ropeLightColors`: Primary colors for the viewport frame lights.
- `ropeLightSpeed`: Speed of the light flow animation.
- `ropeLightThickness`: Thickness of the light strip.
- `ropeLightGlowIntensity`: Atmosphere glow intensity.

---

## ⚙️ Setup & Configuration

### 1. Environment Variables
Create a `.env` file in the project root with the following keys:

```bash
# === CMS & PRODUCTION AUTH ===
GITHUB_TOKEN=github_pat_...        # Required for production commits (GitHub Mode)
ADMIN_PASSWORD=your_password       # Master admin toggle for Unified Dashboard
EDITOR_PASSWORD=your_password      # Access to YAML content editing
BLOG_PASSWORD=your_password        # Access to Blog CMS
SECRET_PASSWORD=your_password      # Access to restricted resources

# === COMMUNICATIONS (EmailJS) ===
EMAILJS_SERVICE_ID=your_id         # Service ID from EmailJS dashboard
EMAILJS_TEMPLATE_ID=your_template  # Template ID for contact forms
EMAIL_API_KEY=your_public_key      # Public Key from EmailJS account
```

### 2. Local Development
Run the Vite development server. The CMS will automatically detect `localhost` and enable **Local Mode**.

```bash
npm run dev
```

### 3. Production Deployment (Vercel)
Ensure `GITHUB_TOKEN` is set in your Vercel project settings. The CMS will use **Cloud Mode** to commit changes directly to your repository.

---

## 🛠 Troubleshooting

### "Update Section" Not Persisting
- **Check Audit Logs**: Open the "Logs" tab in the CMS. It will show the exact failure (e.g., "Conflict Detected" or "Path Access Denied").
- **Local Mode**: Ensure you are running on `localhost:8080` (or your configured port). Writing to the local filesystem only works when the development server is active.
- **GitHub Mode**: Verify your `GITHUB_TOKEN` has `Contents: Read/Write` permissions for the repository.

### Hydration Mismatch Warnings
- The CMS uses a hydration-safe initialization pattern in `CMSContext.tsx`. If you see warnings, ensure you haven't manually modified state initialization outside of `useEffect`.

---

## 🔒 Security Posture
- **Path Isolation**: The CMS is strictly locked to `src/data/`. Any attempt to write outside this directory is blocked by the backend core.
- **Atomic Writes**: Local saves use a `.tmp` and `.bak` rotation logic to prevent data corruption during power loss or server resets.
- **SHA Verification**: Every GitHub commit verifies the latest SHA to prevent overwriting changes made by other team members.
