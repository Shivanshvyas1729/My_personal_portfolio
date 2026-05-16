import React, { useRef, useCallback } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

interface MagneticProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

/**
 * Magnetic Component
 * 
 * Optimized with MotionValues to avoid React re-renders on mouse movement.
 */
const Magnetic: React.FC<MagneticProps> = ({ 
  children, 
  strength = 0.35, // Balanced default strength
  className = "" 
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Use MotionValues for direct DOM updates (no re-renders)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Physics-based spring configuration
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    
    // Distance from the center of the element
    const centerRelativeX = clientX - (left + width / 2);
    const centerRelativeY = clientY - (top + height / 2);
    
    mouseX.set(centerRelativeX * strength);
    mouseY.set(centerRelativeY * strength);
  }, [strength, mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y, z: 0 }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Magnetic;
