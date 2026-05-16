import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';

/**
 * CursorGlow component provides a soft, ambient glowing light that follows the cursor
 * with smooth delayed movement (lerp) for a premium, reactive feel.
 */
const CursorGlow = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  const glowRef = useRef<HTMLDivElement>(null);
  const position = useRef({ x: -1000, y: -1000 });
  const targetPosition = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetPosition.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let animationFrameId: number;

    const animate = () => {
      const lerpFactor = 0.04; // Slightly slower for smoother feel

      position.current.x += (targetPosition.current.x - position.current.x) * lerpFactor;
      position.current.y += (targetPosition.current.y - position.current.y) * lerpFactor;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0) translate(-50%, -50%)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Theme-aware colors
  const glowColor = isDark 
    ? 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.03) 50%, transparent 80%)'
    : 'radial-gradient(circle, rgba(59, 130, 246, 0.04) 0%, rgba(139, 92, 246, 0.01) 50%, transparent 80%)';

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '800px',
        height: '800px',
        pointerEvents: 'none',
        zIndex: -1,
        borderRadius: '100%',
        background: glowColor,
        filter: 'blur(100px)',
        willChange: 'transform',
      }}
    />
  );
};

export default CursorGlow;
