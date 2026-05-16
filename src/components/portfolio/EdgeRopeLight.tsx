import React, { useMemo } from 'react';
import { portfolioData } from '@/data/portfolioData';
import { useTheme } from '@/hooks/useTheme';

const EdgeRopeLight = () => {
  const { theme } = useTheme();
  const settings = portfolioData.settings;

  const config = useMemo(() => {
    const resolvedTheme = theme === 'system' 
      ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;

    const defaultColor = resolvedTheme === 'dark' 
      ? (settings?.ropeLightColorDark || "#7dd3fc")
      : (settings?.ropeLightColorLight || "#3b82f6");

    const colors = settings?.ropeLightColors && settings.ropeLightColors.length > 0
      ? settings.ropeLightColors
      : [defaultColor];

    const sharpColors = resolvedTheme === 'dark'
      ? (settings?.sharpLightColorsDark && settings.sharpLightColorsDark.length > 0 ? settings.sharpLightColorsDark : colors)
      : (settings?.sharpLightColorsLight && settings.sharpLightColorsLight.length > 0 ? settings.sharpLightColorsLight : colors);

    return {
      colors,
      sharpColors,
      speed: settings?.ropeLightSpeed || 15,
      thickness: settings?.ropeLightThickness || 3,
      sharpThickness: settings?.sharpLightThickness || settings?.ropeLightThickness || 3,
      glow: settings?.ropeLightGlowIntensity || 5,
    };
  }, [theme, settings]);

  const horizontalGradient = useMemo(() => {
    const c = config.sharpColors.map(col => col).join(', ');
    return `linear-gradient(to right, transparent, ${c}, transparent)`;
  }, [config.sharpColors]);

  const verticalGradient = useMemo(() => {
    const c = config.sharpColors.map(col => col).join(', ');
    return `linear-gradient(to bottom, transparent, ${c}, transparent)`;
  }, [config.sharpColors]);

  return (
    <div 
      className="fixed inset-0 z-[9999] pointer-events-none select-none overflow-hidden" 
      style={{ height: '100lvh' }}
      aria-hidden="true"
    >
      {/* Top Rope */}
      <div className="absolute top-0 left-0 w-[200%] h-full pointer-events-none">
        <div 
          className="absolute top-0 left-0 w-full animate-rope-h"
          style={{ 
            height: `${config.sharpThickness}px`, 
            background: horizontalGradient,
            animationDuration: `${config.speed}s`,
            boxShadow: `0 0 ${config.glow * 2}px ${config.sharpColors[0]}`
          }}
        />
      </div>

      {/* Bottom Rope */}
      <div className="absolute bottom-0 left-0 w-[200%] h-full pointer-events-none">
        <div 
          className="absolute bottom-0 left-0 w-full animate-rope-h-rev"
          style={{ 
            height: `${config.sharpThickness}px`, 
            background: horizontalGradient,
            animationDuration: `${config.speed * 1.1}s`,
            boxShadow: `0 0 ${config.glow * 2}px ${config.sharpColors[config.sharpColors.length - 1]}`
          }}
        />
      </div>

      {/* Left Rope */}
      <div className="absolute top-0 left-0 w-full h-[200%] pointer-events-none">
        <div 
          className="absolute top-0 left-0 h-full animate-rope-v-rev"
          style={{ 
            width: `${config.sharpThickness}px`, 
            background: verticalGradient,
            animationDuration: `${config.speed * 1.3}s`,
            boxShadow: `0 0 ${config.glow * 2}px ${config.sharpColors[0]}`
          }}
        />
      </div>

      {/* Right Rope */}
      <div className="absolute top-0 right-0 w-full h-[200%] pointer-events-none">
        <div 
          className="absolute top-0 right-0 h-full animate-rope-v"
          style={{ 
            width: `${config.sharpThickness}px`, 
            background: verticalGradient,
            animationDuration: `${config.speed * 1.2}s`,
            boxShadow: `0 0 ${config.glow * 2}px ${config.sharpColors[config.sharpColors.length - 1]}`
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
        .animate-rope-h { animation: rope-h linear infinite; }
        .animate-rope-h-rev { animation: rope-h-rev linear infinite; }
        .animate-rope-v { animation: rope-v linear infinite; }
        .animate-rope-v-rev { animation: rope-v-rev linear infinite; }
      `}</style>
    </div>
  );
};

export default React.memo(EdgeRopeLight);

