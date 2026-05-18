import React, { useMemo } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useCMSData } from '@/context/CMSContext';

const EdgeRopeLight = () => {
  const { theme } = useTheme();
  const settings = useCMSData(d => d.settings);

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

    // ── Dynamic mode parameters ──
    const speed = isDark
      ? (settings.ropeLightSpeedDark ?? settings.ropeLightSpeed ?? 15)
      : (settings.ropeLightSpeedLight ?? settings.ropeLightSpeed ?? 15);

    const thickness = isDark
      ? (settings.ropeLightThicknessDark ?? settings.ropeLightThickness ?? 3)
      : (settings.ropeLightThicknessLight ?? settings.ropeLightThickness ?? 3);

    const sharpThickness = isDark
      ? (settings.sharpLightThicknessDark ?? (settings.sharpLightThickness || settings.ropeLightThicknessDark || settings.ropeLightThickness || 2.5))
      : (settings.sharpLightThicknessLight ?? (settings.sharpLightThickness || settings.ropeLightThicknessLight || settings.ropeLightThickness || 2.5));

    const glow = isDark
      ? (settings.ropeLightGlowIntensityDark ?? settings.ropeLightGlowIntensity ?? 5)
      : (settings.ropeLightGlowIntensityLight ?? settings.ropeLightGlowIntensity ?? 5);

    return {
      colors,
      sharpColors,
      speed,
      thickness,
      sharpThickness,
      glow,
    };
  }, [theme, settings]);

  if (!settings || !config) return null;

  const horizontalGradient = useMemo(() => {
    const c = config.sharpColors.map(col => col).join(', ');
    return `linear-gradient(to right, transparent, ${c}, transparent)`;
  }, [config.sharpColors]);

  const verticalGradient = useMemo(() => {
    const c = config.sharpColors.map(col => col).join(', ');
    return `linear-gradient(to bottom, transparent, ${c}, transparent)`;
  }, [config.sharpColors]);

  const horizontalBlurGradient = useMemo(() => {
    const c = config.colors.map(col => col).join(', ');
    return `linear-gradient(to right, transparent, ${c}, transparent)`;
  }, [config.colors]);

  const verticalBlurGradient = useMemo(() => {
    const c = config.colors.map(col => col).join(', ');
    return `linear-gradient(to bottom, transparent, ${c}, transparent)`;
  }, [config.colors]);

  return (
    <div 
      className="fixed inset-0 z-[9999] pointer-events-none select-none overflow-hidden" 
      style={{ height: '100lvh' }}
      aria-hidden="true"
    >
      {/* ==================== FOG ROPE LIGHTS (High-Performance Masked Ambient Glow) ==================== */}
      {/* Top Fog */}
      <div 
        className="absolute top-0 left-0 w-full animate-rope-breathe-1"
        style={{ 
          height: `${config.thickness * 18}px`, 
          background: horizontalBlurGradient,
          opacity: 0.35,
          maskImage: 'linear-gradient(to bottom, black 15%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 15%, transparent 100%)',
          willChange: 'opacity',
          contain: 'layout paint style',
        }}
      />

      {/* Bottom Fog */}
      <div 
        className="absolute bottom-0 left-0 w-full animate-rope-breathe-2"
        style={{ 
          height: `${config.thickness * 18}px`, 
          background: horizontalBlurGradient,
          opacity: 0.35,
          maskImage: 'linear-gradient(to top, black 15%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 15%, transparent 100%)',
          willChange: 'opacity',
          contain: 'layout paint style',
        }}
      />

      {/* Left Fog */}
      <div 
        className="absolute top-0 left-0 h-full animate-rope-breathe-3"
        style={{ 
          width: `${config.thickness * 18}px`, 
          background: verticalBlurGradient,
          opacity: 0.35,
          maskImage: 'linear-gradient(to right, black 15%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, black 15%, transparent 100%)',
          willChange: 'opacity',
          contain: 'layout paint style',
        }}
      />

      {/* Right Fog */}
      <div 
        className="absolute top-0 right-0 h-full animate-rope-breathe-4"
        style={{ 
          width: `${config.thickness * 18}px`, 
          background: verticalBlurGradient,
          opacity: 0.35,
          maskImage: 'linear-gradient(to left, black 15%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to left, black 15%, transparent 100%)',
          willChange: 'opacity',
          contain: 'layout paint style',
        }}
      />

      {/* ==================== SHARP ROPE LIGHTS (Crisp Inner Neon Outline) ==================== */}
      {/* Top Sharp */}
      <div className="absolute top-0 left-0 w-[200%] h-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 w-full animate-rope-h"
          style={{ 
            height: `${config.sharpThickness}px`, 
            background: horizontalGradient,
            animationDuration: `${config.speed}s`,
            willChange: 'transform',
            contain: 'layout paint style',
          }}
        />
      </div>

      {/* Bottom Sharp */}
      <div className="absolute bottom-0 left-0 w-[200%] h-full overflow-hidden">
        <div 
          className="absolute bottom-0 left-0 w-full animate-rope-h-rev"
          style={{ 
            height: `${config.sharpThickness}px`, 
            background: horizontalGradient,
            animationDuration: `${config.speed * 1.1}s`,
            willChange: 'transform',
            contain: 'layout paint style',
          }}
        />
      </div>

      {/* Left Sharp */}
      <div className="absolute top-0 left-0 w-full h-[200%] overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full animate-rope-v-rev"
          style={{ 
            width: `${config.sharpThickness}px`, 
            background: verticalGradient,
            animationDuration: `${config.speed * 1.3}s`,
            willChange: 'transform',
            contain: 'layout paint style',
          }}
        />
      </div>

      {/* Right Sharp */}
      <div className="absolute top-0 right-0 w-full h-[200%] overflow-hidden">
        <div 
          className="absolute top-0 right-0 h-full animate-rope-v"
          style={{ 
            width: `${config.sharpThickness}px`, 
            background: verticalGradient,
            animationDuration: `${config.speed * 1.2}s`,
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
          0%, 100% { opacity: 0.20; transform: translate3d(0, 0, 0); }
          50% { opacity: 0.40; transform: translate3d(0, 0, 0); }
        }
        @keyframes rope-breathe-2 {
          0%, 100% { opacity: 0.40; transform: translate3d(0, 0, 0); }
          50% { opacity: 0.20; transform: translate3d(0, 0, 0); }
        }
        @keyframes rope-breathe-3 {
          0%, 100% { opacity: 0.25; transform: translate3d(0, 0, 0); }
          50% { opacity: 0.45; transform: translate3d(0, 0, 0); }
        }
        @keyframes rope-breathe-4 {
          0%, 100% { opacity: 0.45; transform: translate3d(0, 0, 0); }
          50% { opacity: 0.25; transform: translate3d(0, 0, 0); }
        }
        .animate-rope-h { animation: rope-h linear infinite; }
        .animate-rope-h-rev { animation: rope-h-rev linear infinite; }
        .animate-rope-v { animation: rope-v linear infinite; }
        .animate-rope-v-rev { animation: rope-v-rev linear infinite; }
        
        .animate-rope-breathe-1 { animation: rope-breathe-1 7s ease-in-out infinite; }
        .animate-rope-breathe-2 { animation: rope-breathe-2 7s ease-in-out infinite; }
        .animate-rope-breathe-3 { animation: rope-breathe-3 8s ease-in-out infinite; }
        .animate-rope-breathe-4 { animation: rope-breathe-4 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default React.memo(EdgeRopeLight);

