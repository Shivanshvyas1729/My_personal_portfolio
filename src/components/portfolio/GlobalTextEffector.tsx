import React, { useMemo } from 'react';
import { useCMSData } from '@/context/CMSContext';

/**
 * GlobalTextEffector
 * 
 * Injects global CSS styles to handle fluid text hover interactions.
 * Optimized for performance by reducing the number of selectors and using GPU-friendly properties.
 */
const GlobalTextEffector = () => {
  const settings = useCMSData(d => d.settings);

  const css = useMemo(() => {
    if (!settings) return "";

    const speed = settings.textTransitionSpeed || "0.4s"; // Slightly faster for responsiveness
    const animSpeed = settings.textAnimationSpeed || "3s";
    
    const hoverColors = settings.textHoverColors?.length 
      ? settings.textHoverColors 
      : (settings.ropeLightColors?.length ? settings.ropeLightColors : ["#3b82f6"]);
    
    const glow = settings.textGlowIntensity || 0;
    const isGradient = hoverColors.length > 1;
    const primaryColor = hoverColors[0];

    let textHoverStyles = "";
    if (isGradient) {
      const gradient = `linear-gradient(135deg, ${hoverColors.join(', ')}, ${hoverColors[0]})`;
      textHoverStyles = `
        background-image: ${gradient} !important;
        background-size: 200% auto !important;
        -webkit-background-clip: text !important;
        background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
        color: transparent !important;
        animation: text-flow ${animSpeed} linear infinite !important;
        ${glow > 0 ? `filter: drop-shadow(0 0 ${glow * 2}px ${primaryColor}88) !important;` : ""}
      `;
    } else {
      textHoverStyles = `
        color: ${primaryColor} !important;
        background-image: none !important;
        ${glow > 0 ? `text-shadow: 0 0 ${glow * 4}px ${primaryColor}88 !important;` : ""}
      `;
    }

    return `
      @keyframes text-flow {
        0% { background-position: 0% 50%; }
        100% { background-position: 200% 50%; }
      }

      /* Optimized Base Styles */
      h1, h2, h3, h4, h5, h6, p, span, a, button {
        transition: color ${speed} cubic-bezier(0.4, 0, 0.2, 1), 
                    text-shadow ${speed} cubic-bezier(0.4, 0, 0.2, 1), 
                    filter ${speed} cubic-bezier(0.4, 0, 0.2, 1);
        will-change: color;
      }
      
      /* Global RESET - Simplified */
      h1:not(.gradient-text), h2:not(.gradient-text), h3:not(.gradient-text), 
      h4:not(.gradient-text), h5:not(.gradient-text), h6:not(.gradient-text), 
      p:not(.gradient-text), span:not(.gradient-text), a:not(.gradient-text), 
      button:not(.gradient-text) {
        -webkit-text-fill-color: inherit;
        background-clip: border-box;
      }
      
      /* Hover Targets */
      h1:not(.gradient-text):not(.no-text-effect *):hover,
      h2:not(.gradient-text):not(.no-text-effect *):hover,
      h3:not(.gradient-text):not(.no-text-effect *):hover,
      p:not(.gradient-text):not(.no-text-effect *):hover,
      span:not(.gradient-text):not(.no-text-effect *):hover,
      a:not(.gradient-text):not(.no-text-effect *):hover,
      button:not(.gradient-text):not(.no-text-effect *):hover {
        ${textHoverStyles}
        transform: translateZ(0);
      }

      .gradient-text {
        -webkit-text-fill-color: transparent !important;
        background-clip: text !important;
        background-image: var(--gradient-primary);
      }
      
      .gradient-text:hover {
        ${isGradient ? `background-image: linear-gradient(135deg, ${hoverColors.join(', ')}, ${hoverColors[0]}) !important;` : ""}
        animation: text-flow ${animSpeed} linear infinite !important;
        background-size: 200% auto !important;
      }
    `;
  }, [settings]);

  return (
    <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: css }} />
  );
};

export default React.memo(GlobalTextEffector);
