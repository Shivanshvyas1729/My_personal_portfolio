import React, { useMemo, useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useCMSData } from '@/context/CMSContext';

const COLOR_NAMES: Record<string, string> = {
  gold: '#ffd700',
  blue: '#0000ff',
  cyan: '#00ffff',
  purple: '#800080',
  pink: '#ffc0cb',
  green: '#008000',
  orange: '#ffa500',
  white: '#ffffff',
  red: '#ff0000',
  yellow: '#ffff00',
  magenta: '#ff00ff',
};

const hexToHsl = (hex: string): { h: number; s: number; l: number; a: number } => {
  hex = hex.replace(/^#/, '');
  let a = 1.0;
  
  if (hex.length === 8) {
    a = parseInt(hex.substring(6, 8), 16) / 255;
    hex = hex.substring(0, 6);
  } else if (hex.length === 4) {
    a = parseInt(hex.substring(3, 4) + hex.substring(3, 4), 16) / 255;
    hex = hex.substring(0, 3);
  }
  
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
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
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: parseFloat(a.toFixed(2)),
  };
};

const parseToHsl = (colorStr: string): { h: number; s: number; l: number; a: number } => {
  const str = colorStr.trim().toLowerCase();
  
  if (COLOR_NAMES[str]) {
    return hexToHsl(COLOR_NAMES[str]);
  }
  
  if (str.startsWith('#') || /^[0-9a-f]{3,8}$/.test(str)) {
    return hexToHsl(str);
  }
  
  const rgbMatch = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10) / 255;
    const g = parseInt(rgbMatch[2], 10) / 255;
    const b = parseInt(rgbMatch[3], 10) / 255;
    const a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1.0;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return { 
      h: Math.round(h * 360), 
      s: Math.round(s * 100), 
      l: Math.round(l * 100),
      a: parseFloat(a.toFixed(2))
    };
  }
  
  const hslMatch = str.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)/);
  if (hslMatch) {
    const a = hslMatch[4] ? parseFloat(hslMatch[4]) : 1.0;
    return {
      h: parseInt(hslMatch[1], 10),
      s: parseInt(hslMatch[2], 10),
      l: parseInt(hslMatch[3], 10),
      a: parseFloat(a.toFixed(2))
    };
  }
  
  return { h: 200, s: 95, l: 70, a: 1.0 }; // default fallback
};

const adjustColor = (colorStr: string, mode: 'mobile' | 'tablet' | 'desktop', isDark: boolean, forceOpaque: boolean = false): string => {
  const hsl = parseToHsl(colorStr);
  let { h, s, l, a } = hsl;
  const isWhite = l > 90 && s < 10;
  
  if (isDark) {
    if (mode === 'mobile') {
      if (!isWhite) {
        s = Math.min(100, Math.round(s * 1.4));
        if (s < 75) s = 75; // enforce extra high saturation on mobile for vibrancy
      }
      l = Math.min(95, Math.round(l * 1.3));
      if (l < 55 && !isWhite) l = 55; // make sure it's bright enough to pop
    } else if (mode === 'tablet') {
      if (!isWhite) {
        s = Math.min(100, Math.round(s * 1.15));
      }
      l = Math.min(95, Math.round(l * 1.1));
      if (l < 45 && !isWhite) l = 45;
    }
  } else {
    // Light mode: keep colors softer and more pastel to avoid harsh contrast on light backgrounds
    if (mode === 'mobile') {
      if (!isWhite) {
        s = Math.min(85, Math.round(s * 1.1));
      }
      l = Math.min(85, Math.round(l * 1.05));
    } else if (mode === 'tablet') {
      if (!isWhite) {
        s = Math.min(80, Math.round(s * 1.0));
      }
      l = Math.min(80, Math.round(l * 1.0));
    }
  }
  
  const finalAlpha = forceOpaque ? 1.0 : a;
  return `hsla(${h}, ${s}%, ${l}%, ${finalAlpha})`;
};

const EdgeRopeLight = () => {
  const { theme } = useTheme();
  const settings = useCMSData(d => d.settings);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mode = useMemo(() => {
    if (windowWidth < 768) return 'mobile';
    if (windowWidth < 1024) return 'tablet';
    return 'desktop';
  }, [windowWidth]);

  const config = useMemo(() => {
    if (!settings) return null;

    const resolvedTheme = theme === 'system'
      ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;

    const isDark = resolvedTheme === 'dark';

    // ── Fog colors extraction ──
    const colors = (isDark
      ? (settings.ropeLightColorsDark && settings.ropeLightColorsDark.length > 0 ? settings.ropeLightColorsDark : settings.ropeLightColors)
      : (settings.ropeLightColorsLight && settings.ropeLightColorsLight.length > 0 ? settings.ropeLightColorsLight : settings.ropeLightColors)
    ) && (isDark ? settings.ropeLightColorsDark || settings.ropeLightColors : settings.ropeLightColorsLight || settings.ropeLightColors)?.filter(Boolean).length > 0
      ? (isDark ? settings.ropeLightColorsDark || settings.ropeLightColors : settings.ropeLightColorsLight || settings.ropeLightColors)!.filter(Boolean)
      : [isDark ? (settings.ropeLightColorDark || "#7dd3fc") : (settings.ropeLightColorLight || "#3b82f6")];

    // ── Sharp outline colors extraction ──
    const sharpColors = (isDark
      ? (settings.sharpLightColorsDark && settings.sharpLightColorsDark.length > 0 ? settings.sharpLightColorsDark : colors)
      : (settings.sharpLightColorsLight && settings.sharpLightColorsLight.length > 0 ? settings.sharpLightColorsLight : colors)
    ).filter(Boolean);

    // ── Responsive Modifiers & Scale Factor ──
    // ResponsiveFogIntensity = DesktopFogIntensity * clamp(0.55 + (ViewportWidth / 1920) * 0.45, 0.55, 1.0)
    const scaleFactor = Math.min(1.0, Math.max(0.55, 0.55 + (windowWidth / 1920) * 0.45));

    let glowMultiplier = 1.0;
    let speedMultiplier = 1.0;
    let thicknessMultiplier = 1.0;
    
    // Scale opacity in light mode to make it soft, visible, and clean
    let glowOpacityMinMult = isDark ? 0.04 : 0.02;
    let glowOpacityMaxMult = isDark ? 0.08 : 0.045;

    if (mode === 'mobile') {
      glowMultiplier = isDark ? 1.5 : 1.15;
      speedMultiplier = 1.3; // 30% slower
      thicknessMultiplier = 1.35;
      glowOpacityMinMult = isDark ? 0.06 : 0.03;
      glowOpacityMaxMult = isDark ? 0.12 : 0.065;
    } else if (mode === 'tablet') {
      glowMultiplier = isDark ? 1.2 : 1.08;
      speedMultiplier = 1.15; // 15% slower
      thicknessMultiplier = 1.15;
      glowOpacityMinMult = isDark ? 0.05 : 0.024;
      glowOpacityMaxMult = isDark ? 0.09 : 0.052;
    }

    // ── Dynamic mode parameters ──
    const rawSharpSpeed = isDark
      ? (settings.sharpLightSpeedDark ?? settings.sharpLightSpeed ?? settings.ropeLightSpeedDark ?? settings.ropeLightSpeed ?? 15)
      : (settings.sharpLightSpeedLight ?? settings.sharpLightSpeed ?? settings.ropeLightSpeedLight ?? settings.ropeLightSpeed ?? 15);

    const rawFogSpeed = isDark
      ? (settings.ropeLightSpeedDark ?? settings.ropeLightSpeed ?? 15)
      : (settings.ropeLightSpeedLight ?? settings.ropeLightSpeed ?? 15);

    const baseSharpSpeed = mode === 'mobile' ? Math.max(18, rawSharpSpeed) : rawSharpSpeed;
    const baseFogSpeed = mode === 'mobile' ? Math.max(18, rawFogSpeed) : rawFogSpeed;

    const sharpSpeed = baseSharpSpeed * speedMultiplier;
    const fogSpeed = baseFogSpeed * speedMultiplier;

    const rawThickness = isDark
      ? (settings.ropeLightThicknessDark ?? settings.ropeLightThickness ?? 3)
      : (settings.ropeLightThicknessLight ?? settings.ropeLightThickness ?? 3);

    const rawSharpThickness = isDark
      ? (settings.sharpLightThicknessDark ?? (settings.sharpLightThickness || settings.ropeLightThicknessDark || settings.ropeLightThickness || 2.5))
      : (settings.sharpLightThicknessLight ?? (settings.sharpLightThickness || settings.ropeLightThicknessLight || settings.ropeLightThickness || 2.5));

    const thickness = rawThickness * thicknessMultiplier;
    const sharpThickness = rawSharpThickness * thicknessMultiplier;

    const rawGlow = isDark
      ? (settings.ropeLightGlowIntensityDark ?? settings.ropeLightGlowIntensity ?? 5)
      : (settings.ropeLightGlowIntensityLight ?? settings.ropeLightGlowIntensity ?? 5);

    // Apply the responsive scale factor to glow (intensity)
    const glow = rawGlow * glowMultiplier * scaleFactor;

    // Fog height / spread multiplier: thinner spread in light mode for subtle blending
    const fogHeightMultiplier = isDark ? 18 : 10;
    
    // Dynamic spread width/height of the fog, scaled down responsive-ly
    const fogSpread = thickness * fogHeightMultiplier * scaleFactor;

    // Adjust each color string dynamically for brightness and saturation
    const adjustedColors = colors.map(c => adjustColor(c, mode, isDark, true));
    const adjustedSharpColors = sharpColors.map(c => adjustColor(c, mode, isDark, false));

    return {
      colors: adjustedColors,
      sharpColors: adjustedSharpColors,
      sharpSpeed,
      fogSpeed,
      thickness,
      sharpThickness,
      glow,
      glowOpacityMinMult,
      glowOpacityMaxMult,
      fogSpread,
    };
  }, [theme, settings, mode, windowWidth]);

  if (!settings || !config) return null;

  const horizontalGradient = useMemo(() => {
    const c = config.sharpColors.map(col => col).join(', ');
    return `linear-gradient(to right, transparent, ${c}, transparent, ${c}, transparent)`;
  }, [config.sharpColors]);

  const verticalGradient = useMemo(() => {
    const c = config.sharpColors.map(col => col).join(', ');
    return `linear-gradient(to bottom, transparent, ${c}, transparent, ${c}, transparent)`;
  }, [config.sharpColors]);

  const horizontalBlurGradient = useMemo(() => {
    const c = config.colors.map(col => col).join(', ');
    return `linear-gradient(to right, transparent, ${c}, transparent, ${c}, transparent)`;
  }, [config.colors]);

  const verticalBlurGradient = useMemo(() => {
    const c = config.colors.map(col => col).join(', ');
    return `linear-gradient(to bottom, transparent, ${c}, transparent, ${c}, transparent)`;
  }, [config.colors]);

  const key = `${mode}-${config.sharpSpeed}-${config.fogSpeed}-${config.glow}-${config.thickness}-${config.sharpThickness}-${config.colors.join(',')}-${config.sharpColors.join(',')}`;

  return (
    <div 
      key={key}
      className="fixed inset-0 z-[9999] pointer-events-none select-none overflow-hidden" 
      style={{ 
        height: '100lvh',
        '--rope-glow-1-min': config.glow * config.glowOpacityMinMult,
        '--rope-glow-1-max': config.glow * config.glowOpacityMaxMult,
        '--rope-glow-2-min': config.glow * config.glowOpacityMinMult,
        '--rope-glow-2-max': config.glow * config.glowOpacityMaxMult,
        '--rope-glow-3-min': config.glow * config.glowOpacityMinMult * 1.25,
        '--rope-glow-3-max': config.glow * config.glowOpacityMaxMult * 1.125,
        '--rope-glow-4-min': config.glow * config.glowOpacityMinMult * 1.25,
        '--rope-glow-4-max': config.glow * config.glowOpacityMaxMult * 1.125,
      } as React.CSSProperties}
      aria-hidden="true"
    >
      {/* ==================== FOG ROPE LIGHTS (High-Performance Masked Ambient Glow) ==================== */}
      {/* Top Fog */}
      <div 
        className="absolute top-0 left-0 w-full"
        style={{ 
          height: `${config.fogSpread}px`, 
          maskImage: 'linear-gradient(to bottom, black 15%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 15%, transparent 100%)',
          animation: `rope-breathe-1 7s ease-in-out infinite`,
          willChange: 'opacity',
          contain: 'layout paint style',
        }}
      >
        <div className="w-[200%] h-full overflow-hidden">
          <div 
            className="w-full h-full"
            style={{ 
              background: horizontalBlurGradient,
              animation: `rope-h ${config.fogSpeed}s linear infinite`,
              willChange: 'transform',
              contain: 'layout paint style',
            }}
          />
        </div>
      </div>

      {/* Bottom Fog */}
      <div 
        className="absolute bottom-0 left-0 w-full"
        style={{ 
          height: `${config.fogSpread}px`, 
          maskImage: 'linear-gradient(to top, black 15%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 15%, transparent 100%)',
          animation: `rope-breathe-2 7s ease-in-out infinite`,
          willChange: 'opacity',
          contain: 'layout paint style',
        }}
      >
        <div className="w-[200%] h-full overflow-hidden">
          <div 
            className="w-full h-full"
            style={{ 
              background: horizontalBlurGradient,
              animation: `rope-h-rev ${config.fogSpeed * 1.1}s linear infinite`,
              willChange: 'transform',
              contain: 'layout paint style',
            }}
          />
        </div>
      </div>

      {/* Left Fog */}
      <div 
        className="absolute top-0 left-0 h-full"
        style={{ 
          width: `${config.fogSpread}px`, 
          maskImage: 'linear-gradient(to right, black 15%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, black 15%, transparent 100%)',
          animation: `rope-breathe-3 8s ease-in-out infinite`,
          willChange: 'opacity',
          contain: 'layout paint style',
        }}
      >
        <div className="w-full h-[200%] overflow-hidden">
          <div 
            className="w-full h-full"
            style={{ 
              background: verticalBlurGradient,
              animation: `rope-v-rev ${config.fogSpeed * 1.3}s linear infinite`,
              willChange: 'transform',
              contain: 'layout paint style',
            }}
          />
        </div>
      </div>

      {/* Right Fog */}
      <div 
        className="absolute top-0 right-0 h-full"
        style={{ 
          width: `${config.fogSpread}px`, 
          maskImage: 'linear-gradient(to left, black 15%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to left, black 15%, transparent 100%)',
          animation: `rope-breathe-4 8s ease-in-out infinite`,
          willChange: 'opacity',
          contain: 'layout paint style',
        }}
      >
        <div className="w-full h-[200%] overflow-hidden">
          <div 
            className="w-full h-full"
            style={{ 
              background: verticalBlurGradient,
              animation: `rope-v ${config.fogSpeed * 1.2}s linear infinite`,
              willChange: 'transform',
              contain: 'layout paint style',
            }}
          />
        </div>
      </div>

      {/* ==================== SHARP ROPE LIGHTS (Crisp Inner Neon Outline) ==================== */}
      {/* Top Sharp */}
      <div className="absolute top-0 left-0 w-[200%] h-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 w-full"
          style={{ 
            height: `${config.sharpThickness}px`, 
            background: horizontalGradient,
            animation: `rope-h ${config.sharpSpeed}s linear infinite`,
            willChange: 'transform',
            contain: 'layout paint style',
          }}
        />
      </div>

      {/* Bottom Sharp */}
      <div className="absolute bottom-0 left-0 w-[200%] h-full overflow-hidden">
        <div 
          className="absolute bottom-0 left-0 w-full"
          style={{ 
            height: `${config.sharpThickness}px`, 
            background: horizontalGradient,
            animation: `rope-h-rev ${config.sharpSpeed * 1.1}s linear infinite`,
            willChange: 'transform',
            contain: 'layout paint style',
          }}
        />
      </div>

      {/* Left Sharp */}
      <div className="absolute top-0 left-0 w-full h-[200%] overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full"
          style={{ 
            width: `${config.sharpThickness}px`, 
            background: verticalGradient,
            animation: `rope-v-rev ${config.sharpSpeed * 1.3}s linear infinite`,
            willChange: 'transform',
            contain: 'layout paint style',
          }}
        />
      </div>

      {/* Right Sharp */}
      <div className="absolute top-0 right-0 w-full h-[200%] overflow-hidden">
        <div 
          className="absolute top-0 right-0 h-full"
          style={{ 
            width: `${config.sharpThickness}px`, 
            background: verticalGradient,
            animation: `rope-v ${config.sharpSpeed * 1.2}s linear infinite`,
            willChange: 'transform',
            contain: 'layout paint style',
          }}
        />
      </div>

      <style>{`
        @keyframes rope-h {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0%, 0, 0); }
        }
        @keyframes rope-h-rev {
          0% { transform: translate3d(0%, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes rope-v {
          0% { transform: translate3d(0, -50%, 0); }
          100% { transform: translate3d(0, 0%, 0); }
        }
        @keyframes rope-v-rev {
          0% { transform: translate3d(0, 0%, 0); }
          100% { transform: translate3d(0, -50%, 0); }
        }
        @keyframes rope-breathe-1 {
          0%, 100% { opacity: var(--rope-glow-1-min); transform: translate3d(0, 0, 0); }
          50% { opacity: var(--rope-glow-1-max); transform: translate3d(0, 0, 0); }
        }
        @keyframes rope-breathe-2 {
          0%, 100% { opacity: var(--rope-glow-2-max); transform: translate3d(0, 0, 0); }
          50% { opacity: var(--rope-glow-2-min); transform: translate3d(0, 0, 0); }
        }
        @keyframes rope-breathe-3 {
          0%, 100% { opacity: var(--rope-glow-3-min); transform: translate3d(0, 0, 0); }
          50% { opacity: var(--rope-glow-3-max); transform: translate3d(0, 0, 0); }
        }
        @keyframes rope-breathe-4 {
          0%, 100% { opacity: var(--rope-glow-4-max); transform: translate3d(0, 0, 0); }
          50% { opacity: var(--rope-glow-4-min); transform: translate3d(0, 0, 0); }
        }
        .animate-rope-breathe-1 { animation: rope-breathe-1 7s ease-in-out infinite; }
        .animate-rope-breathe-2 { animation: rope-breathe-2 7s ease-in-out infinite; }
        .animate-rope-breathe-3 { animation: rope-breathe-3 8s ease-in-out infinite; }
        .animate-rope-breathe-4 { animation: rope-breathe-4 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default React.memo(EdgeRopeLight);

