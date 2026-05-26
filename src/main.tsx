import { createRoot } from "react-dom/client";
import { applyThemeSetup } from "@/lib/themeSetup";
import { verifyStartup } from "@/config";

// Run environment validation on startup
verifyStartup();

// Apply dynamic CMS theme synchronously before React mounts to prevent FOUC
applyThemeSetup();

import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
