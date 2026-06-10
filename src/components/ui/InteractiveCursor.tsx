import React, { useEffect, useState, useCallback } from "react";
import { motion, useSpring } from "framer-motion";

/**
 * InteractiveCursor
 * 
 * A high-end custom cursor that consists of a small dot and a trailing ring.
 * It reacts to interactive elements (buttons, links) by expanding and changing color.
 */
const InteractiveCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  // Smooth springs for the cursor position
  const springConfig = { damping: 20, stiffness: 250, mass: 0.5 };
  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);

  // Even smoother springs for the trailing ring
  const ringSpringConfig = { damping: 25, stiffness: 150, mass: 0.8 };
  const ringX = useSpring(0, ringSpringConfig);
  const ringY = useSpring(0, ringSpringConfig);

  const moveCursor = useCallback((e: MouseEvent) => {
    cursorX.set(e.clientX);
    cursorY.set(e.clientY);
    ringX.set(e.clientX);
    ringY.set(e.clientY);
  }, [cursorX, cursorY, ringX, ringY]);

  useEffect(() => {
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const isInteractive = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('a') || 
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.closest('.cursor-pointer') ||
        target.closest('.cursor-grab') ||
        target.closest('.cursor-grabbing');
      
      setIsHovering(!!isInteractive);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [moveCursor]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] hidden md:block">
      {/* Trailing Ring */}
      <motion.div
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: isHovering ? 60 : 30,
          height: isHovering ? 60 : 30,
          borderColor: isHovering ? "hsl(var(--primary))" : "rgba(255, 255, 255, 0.2)",
          backgroundColor: "transparent",
        }}
        className="fixed top-0 left-0 border rounded-full transition-colors duration-300"
      />

      {/* Center Dot */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
          backgroundColor: isHovering ? "hsl(var(--primary))" : "white",
        }}
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full shadow-sm"
      />
    </div>
  );
};

export default InteractiveCursor;
