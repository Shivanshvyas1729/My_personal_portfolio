import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, lazy, useState } from "react";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";
import { AuthProvider } from "./hooks/useAuth";
import { CMSProvider } from "./context/CMSContext";
import EdgeRopeLight from "./components/portfolio/EdgeRopeLight";
import GlobalTextEffector from "./components/portfolio/GlobalTextEffector";
import GlobalScrollReveal from "./components/portfolio/GlobalScrollReveal";
import CursorGlow from "./components/ui/CursorGlow";
import InteractiveCursor from "./components/ui/InteractiveCursor";

// Eager — homepage, welcome intro, chatbot, and admin auth load instantly
import Index from "./pages/Index.tsx";
import IntroTransition from "./components/portfolio/IntroTransition";
import ChatAssistant from "./components/portfolio/ChatAssistant";
import { AdminAuth } from "./components/blog/AdminAuth";
import { AnimatePresence, motion } from "framer-motion";

// Lazy — only load when navigated to (reduces initial bundle ~40%)
const AllProjects = lazy(() => import("./pages/AllProjects.tsx"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail.tsx"));
const Blog = lazy(() => import("./pages/Blog.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

// Page loader fallback
const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
  </div>
);

import { useCMSData } from "./context/CMSContext";
import { useEffect, useCallback } from "react";



import Lenis from "lenis";

// Global wrapper that provides the auth lock button available on every page
function AppShell() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const settings = useCMSData(d => d.settings);
  const { theme } = useTheme();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const handleIntroComplete = useCallback(() => setShowIntro(false), []);

  // Cursor preference — default true (premium experience)
  const cursorEnabled = settings?.customCursorEnabled !== false;

  useEffect(() => {
    if (cursorEnabled) {
      document.documentElement.classList.add('has-custom-cursor');
      document.body.style.cursor = 'none';
    } else {
      document.documentElement.classList.remove('has-custom-cursor');
      document.body.style.cursor = 'default';
      // Force repaint
      void document.body.offsetHeight;
      document.body.style.cursor = '';
    }
    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      document.body.style.cursor = '';
    };
  }, [cursorEnabled]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (!settings) return;

    // Helper to parse hex colors to Tailwind-compatible HSL strings
    const hexToHslString = (hex: string, lightnessModifier = 0): string => {
      const clean = (hex || '').replace('#', '').trim();
      let r = 0, g = 0, b = 0;
      if (clean.length === 3) {
        r = parseInt(clean[0] + clean[0], 16) / 255;
        g = parseInt(clean[1] + clean[1], 16) / 255;
        b = parseInt(clean[2] + clean[2], 16) / 255;
      } else if (clean.length >= 6) {
        r = parseInt(clean.substring(0, 2), 16) / 255;
        g = parseInt(clean.substring(2, 4), 16) / 255;
        b = parseInt(clean.substring(4, 6), 16) / 255;
      } else {
        return "";
      }

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      h = Math.round(h * 360);
      s = Math.round(s * 100);
      l = Math.round(Math.min(100, Math.max(0, (l * 100) + lightnessModifier)));

      return `${h} ${s}% ${l}%`;
    };

    const getLuminance = (hex: string): number => {
      const clean = (hex || '').replace('#', '').trim();
      let r = 0, g = 0, b = 0;
      if (clean.length === 3) {
        r = parseInt(clean[0] + clean[0], 16);
        g = parseInt(clean[1] + clean[1], 16);
        b = parseInt(clean[2] + clean[2], 16);
      } else if (clean.length >= 6) {
        r = parseInt(clean.substring(0, 2), 16);
        g = parseInt(clean.substring(2, 4), 16);
        b = parseInt(clean.substring(4, 6), 16);
      }
      const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    const getTintedHsl = (baseHex: string, targetLightness: number, targetSaturation?: number): string => {
      const hsl = hexToHslString(baseHex);
      if (!hsl) return "";
      const parts = hsl.split(" ");
      const h = parts[0];
      const s = targetSaturation !== undefined ? `${targetSaturation}%` : parts[1];
      const l = `${targetLightness}%`;
      return `${h} ${s} ${l}`;
    };

    try {
      // 1. Inject Font Family styling dynamically
      if (settings.themeFontFamily) {
        const fontName = settings.themeFontFamily.trim();
        const linkId = 'dynamic-theme-font';
        let linkElement = document.getElementById(linkId) as HTMLLinkElement;
        if (!linkElement) {
          linkElement = document.createElement('link');
          linkElement.id = linkId;
          linkElement.rel = 'stylesheet';
          document.head.appendChild(linkElement);
        }
        linkElement.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@300;400;500;600;700&display=swap`;
        document.body.style.fontFamily = `"${fontName}", sans-serif`;
      }

      // 2. Inject Primary & Accent Colors
      const primaryHex = settings.themePrimaryColor || "#6366f1";
      const accentHex = settings.themeAccentColor || "#c084fc";
      const primaryHslRaw = hexToHslString(primaryHex);
      const accentHslRaw = hexToHslString(accentHex);

      if (primaryHslRaw) {
        document.documentElement.style.setProperty('--primary', primaryHslRaw);
        document.documentElement.style.setProperty('--ring', primaryHslRaw);
        document.documentElement.style.setProperty('--sidebar-primary', primaryHslRaw);
      }
      if (accentHslRaw) {
        document.documentElement.style.setProperty('--accent', accentHslRaw);
        document.documentElement.style.setProperty('--secondary', accentHslRaw);
        document.documentElement.style.setProperty('--sidebar-accent', accentHslRaw);
      }

      // 3. Detect light vs dark modes dynamically
      const isDarkModeActive =
        theme === "dark" ||
        (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

      const bgIsLight = !isDarkModeActive;

      let bgHsl = "";
      if (bgIsLight) {
        // Light mode
        if (settings.themeBackgroundColor && getLuminance(settings.themeBackgroundColor) > 0.45) {
          bgHsl = hexToHslString(settings.themeBackgroundColor);
        } else {
          // Soft tint of the primary color for a custom, cohesive feel
          bgHsl = getTintedHsl(primaryHex, 98.5, 12);
        }
      } else {
        // Dark mode
        if (settings.themeBackgroundColor && getLuminance(settings.themeBackgroundColor) <= 0.45) {
          bgHsl = hexToHslString(settings.themeBackgroundColor);
        } else {
          // Gorgeous deep tint of primary color for custom midnight feel
          bgHsl = getTintedHsl(primaryHex, 5.0, 18);
        }
      }

      if (bgHsl) {
        // Offset layering calculations
        const bgParts = bgHsl.replace(/%/g, '').split(" ");
        const bgH = bgParts[0];
        const bgS = bgParts[1];
        const bgL = parseFloat(bgParts[2]);

        let cardHsl = "";
        let popoverHsl = "";

        if (bgIsLight) {
          cardHsl = "0 0% 100%";
          popoverHsl = "0 0% 100%";

          document.documentElement.style.setProperty('--background', bgHsl);
          document.documentElement.style.setProperty('--card', cardHsl);
          document.documentElement.style.setProperty('--popover', popoverHsl);
          document.documentElement.style.setProperty('--sidebar-background', bgHsl);

          // Contrast safe variables for Light Mode
          document.documentElement.style.setProperty('--foreground', '222 47% 11%');
          document.documentElement.style.setProperty('--card-foreground', '222 47% 11%');
          document.documentElement.style.setProperty('--popover-foreground', '222 47% 11%');
          document.documentElement.style.setProperty('--muted', '210 40% 95%');
          document.documentElement.style.setProperty('--muted-foreground', '215.4 16.3% 42%');
          document.documentElement.style.setProperty('--border', '214.3 31.8% 88%');

          // Glass and glow variables for Light Mode
          document.documentElement.style.setProperty('--glass-bg', '255 255 255 / 0.75');
          document.documentElement.style.setProperty('--glass-border', primaryHslRaw ? `${primaryHslRaw} / 0.12` : '214.3 31.8% 88% / 0.12');
          document.documentElement.style.setProperty('--glow-primary', primaryHslRaw ? `hsl(${primaryHslRaw} / 0.12)` : 'rgba(99, 102, 241, 0.12)');
          document.documentElement.style.setProperty('--glow-accent', accentHslRaw ? `hsl(${accentHslRaw} / 0.12)` : 'rgba(192, 132, 252, 0.12)');
          document.documentElement.style.setProperty('--particle-opacity', '0.03');
        } else {
          const cardL = Math.min(18, bgL + 4.5);
          const popoverL = Math.min(22, bgL + 7.0);
          cardHsl = `${bgH} ${bgS}% ${cardL}%`;
          popoverHsl = `${bgH} ${bgS}% ${popoverL}%`;

          document.documentElement.style.setProperty('--background', bgHsl);
          document.documentElement.style.setProperty('--card', cardHsl);
          document.documentElement.style.setProperty('--popover', popoverHsl);
          document.documentElement.style.setProperty('--sidebar-background', bgHsl);

          // Contrast safe variables for Dark Mode
          document.documentElement.style.setProperty('--foreground', '210 40% 98%');
          document.documentElement.style.setProperty('--card-foreground', '210 40% 98%');
          document.documentElement.style.setProperty('--popover-foreground', '210 40% 98%');
          document.documentElement.style.setProperty('--muted', '217.2 32.6% 14%');
          document.documentElement.style.setProperty('--muted-foreground', '215 20.2% 65%');
          document.documentElement.style.setProperty('--border', '217.2 32.6% 14.5%');

          // Glass and glow variables for Dark Mode
          document.documentElement.style.setProperty('--glass-bg', `${cardHsl.replace(/%/g, '')} / 0.5`);
          document.documentElement.style.setProperty('--glass-border', primaryHslRaw ? `${primaryHslRaw} / 0.22` : '217.2 32.6% 25% / 0.22');
          document.documentElement.style.setProperty('--glow-primary', primaryHslRaw ? `hsl(${primaryHslRaw} / 0.25)` : 'rgba(99, 102, 241, 0.25)');
          document.documentElement.style.setProperty('--glow-accent', accentHslRaw ? `hsl(${accentHslRaw} / 0.25)` : 'rgba(192, 132, 252, 0.25)');
          document.documentElement.style.setProperty('--particle-opacity', '0.07');
        }
      }

      // 4. Rebuild Dynamic Gradients
      if (primaryHslRaw && accentHslRaw) {
        document.documentElement.style.setProperty('--gradient-primary', `linear-gradient(135deg, hsl(${primaryHslRaw}), hsl(${accentHslRaw}))`);
        document.documentElement.style.setProperty('--gradient-text', `linear-gradient(135deg, hsl(${primaryHslRaw}), hsl(${accentHslRaw}))`);
      }
    } catch (e) {
      console.warn("Dynamic Theme Engine failed to load or apply styles:", e);
    }
  }, [settings, theme]);

  return (
    <>
      {/* Welcome Greeting Intro */}
      <AnimatePresence>
        {showIntro && settings?.introEnabled !== false && (
          <IntroTransition
            key="main-intro"
            onComplete={handleIntroComplete}
            style={settings?.introStyle || 'namaste'}
            primaryText={settings?.introPrimaryText || 'नमस्ते'}
            subtitle={settings?.introSubtitle || 'Namaste'}
            tagline={settings?.introTagline || 'Welcome to my universe'}
            colors={settings?.introColors}
            duration={settings?.introDuration || 3000}
          />
        )}
      </AnimatePresence>

      <div className="w-full min-h-screen overflow-x-hidden flex flex-col relative">
        {/* Global Trailing Interactive Cursor */}
        {cursorEnabled && <InteractiveCursor />}

        {/* Global Cursor Ambient Glow */}
        {cursorEnabled && <CursorGlow />}

        {/* Global Dynamic Text Interaction */}
        <GlobalTextEffector />

        {/* Global Scroll Reveal Animation */}
        <GlobalScrollReveal />

        {/* Global Seamless Rope Light Layer */}
        {settings?.edgeLightsEnabled !== false && <EdgeRopeLight />}

        {/* Global floating lock — visible on every page */}
        <AdminAuth isAdmin={isAdmin} setIsAdmin={setIsAdmin} />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/projects" element={<AllProjects />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>

        {isHomePage && !isAdmin && <ChatAssistant />}
      </div>
    </>
  );
}

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <AuthProvider>
      <CMSProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppShell />
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </CMSProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
