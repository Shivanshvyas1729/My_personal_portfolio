import { portfolioData as defaultPortfolioData } from "@/data/portfolioData";

export const hexToHslString = (hex: string, lightnessModifier = 0): string => {
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

export const applyThemeSetup = () => {
  if (typeof window === "undefined") return;

  try {
    let settings = defaultPortfolioData.settings;
    
    // Check if there is cached data in localStorage/sessionStorage
    const savedPreview = sessionStorage.getItem("cms-preview-data");
    const cachedData = localStorage.getItem("cms-cached-portfolio-data");
    
    if (savedPreview) {
      settings = JSON.parse(savedPreview).settings || settings;
    } else if (cachedData) {
      settings = JSON.parse(cachedData).settings || settings;
    }

    if (!settings) return;

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
    let theme = localStorage.getItem("vite-ui-theme") || "system";
    const isDarkModeActive =
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    const bgIsLight = !isDarkModeActive;

    let bgHsl = "";
    if (bgIsLight) {
      if (settings.themeBackgroundColor && getLuminance(settings.themeBackgroundColor) > 0.45) {
        bgHsl = hexToHslString(settings.themeBackgroundColor);
      } else {
        bgHsl = getTintedHsl(primaryHex, 98.5, 12);
      }
    } else {
      if (settings.themeBackgroundColor && getLuminance(settings.themeBackgroundColor) <= 0.45) {
        bgHsl = hexToHslString(settings.themeBackgroundColor);
      } else {
        bgHsl = getTintedHsl(primaryHex, 5.0, 18);
      }
    }

    if (bgHsl) {
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

        document.documentElement.style.setProperty('--foreground', '222 47% 11%');
        document.documentElement.style.setProperty('--card-foreground', '222 47% 11%');
        document.documentElement.style.setProperty('--popover-foreground', '222 47% 11%');
        document.documentElement.style.setProperty('--muted', '210 40% 95%');
        document.documentElement.style.setProperty('--muted-foreground', '215.4 16.3% 42%');
        document.documentElement.style.setProperty('--border', '214.3 31.8% 88%');

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

        document.documentElement.style.setProperty('--foreground', '210 40% 98%');
        document.documentElement.style.setProperty('--card-foreground', '210 40% 98%');
        document.documentElement.style.setProperty('--popover-foreground', '210 40% 98%');
        document.documentElement.style.setProperty('--muted', '217.2 32.6% 14%');
        document.documentElement.style.setProperty('--muted-foreground', '215 20.2% 65%');
        document.documentElement.style.setProperty('--border', '217.2 32.6% 14.5%');

        document.documentElement.style.setProperty('--glass-bg', `${cardHsl.replace(/%/g, '')} / 0.5`);
        document.documentElement.style.setProperty('--glass-border', primaryHslRaw ? `${primaryHslRaw} / 0.22` : '217.2 32.6% 25% / 0.22');
        document.documentElement.style.setProperty('--glow-primary', primaryHslRaw ? `hsl(${primaryHslRaw} / 0.25)` : 'rgba(99, 102, 241, 0.25)');
        document.documentElement.style.setProperty('--glow-accent', accentHslRaw ? `hsl(${accentHslRaw} / 0.25)` : 'rgba(192, 132, 252, 0.25)');
        document.documentElement.style.setProperty('--particle-opacity', '0.07');
      }
    }

    if (primaryHslRaw && accentHslRaw) {
      document.documentElement.style.setProperty('--gradient-primary', `linear-gradient(135deg, hsl(${primaryHslRaw}), hsl(${accentHslRaw}))`);
      document.documentElement.style.setProperty('--gradient-text', `linear-gradient(135deg, hsl(${primaryHslRaw}), hsl(${accentHslRaw}))`);
    }
  } catch (e) {
    console.warn("Theme setup failed during initialization:", e);
  }
};
