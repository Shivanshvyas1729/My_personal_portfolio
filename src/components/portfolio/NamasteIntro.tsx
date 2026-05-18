import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface NamasteIntroProps {
  onComplete: () => void;
}

const LeftHand = () => (
  <svg 
    width="120" 
    height="200" 
    viewBox="0 0 120 200" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className="text-primary filter drop-shadow-[0_0_12px_rgba(59,130,246,0.45)]"
  >
    {/* Outer contour: Middle finger tip at x=116, y=8. Palm side sits flush at x=120 */}
    <path 
      d="M 30,195 C 20,130 15,65 116,8 C 119,6 120,9 120,12 C 120,65 116,130 115,195" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    {/* Index finger curve: tip at x=108, y=28 */}
    <path 
      d="M 38,195 C 32,145 36,95 106,26 C 108.5,23 111,25 111,28 C 111,85 107,135 107,195" 
      stroke="currentColor" 
      strokeWidth="1.8" 
      strokeLinecap="round"
      opacity="0.85"
    />
    {/* Ring finger curve: tip at x=98, y=48 */}
    <path 
      d="M 46,195 C 42,160 45,115 97,44 C 99,41 102,43 102,46 C 102,95 98,140 98,195" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
      opacity="0.75"
    />
    {/* Pinky finger curve: tip at x=88, y=68 */}
    <path 
      d="M 54,195 C 50,170 52,130 87,64 C 89,61 92,63 92,66 C 92,105 88,150 88,195" 
      stroke="currentColor" 
      strokeWidth="1.2" 
      strokeLinecap="round"
      opacity="0.6"
    />
    {/* Thumb curve folding elegantly inside at the base */}
    <path 
      d="M 30,195 C 28,170 38,150 72,118 C 74.5,115 77.5,117.5 76.5,120 C 65,148 60,165 60,195" 
      stroke="currentColor" 
      strokeWidth="2.0" 
      strokeLinecap="round"
    />
    {/* Elegant inner palm crease details */}
    <path 
      d="M 68,145 C 68,135 72,128 75,124" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeLinecap="round"
      opacity="0.4"
    />
    {/* Wrist bracelets / Elegant Kada lines */}
    <path 
      d="M 28,190 C 50,187 85,187 117,190" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
      opacity="0.8"
    />
    <path 
      d="M 26,196 C 50,193 85,193 115,196" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
);

export default function NamasteIntro({ onComplete }: NamasteIntroProps) {
  const chimePlayed = useRef(false);

  useEffect(() => {
    // 1. Accessibility: Skip intro instantly if user prefers reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      onComplete();
      return;
    }

    // 2. Synthesize Solfeggio sound chime via Web Audio API when hands connect
    const playChime = () => {
      if (chimePlayed.current) return;
      chimePlayed.current = true;

      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        
        // C5 (528 Hz - Solfeggio Transformation freq) and G5 (792 Hz - peaceful interval)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(528, ctx.currentTime);
        
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(792, ctx.currentTime);

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        // Soft bell attack
        gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.15);
        // Long, atmospheric reverb decay
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start();
        osc2.start();

        osc1.stop(ctx.currentTime + 1.9);
        osc2.stop(ctx.currentTime + 1.9);
      } catch (e) {
        console.warn("Web Audio API Chime skipped due to user interaction state:", e);
      }
    };

    // Play chime right when the hands touch (approx 200ms in)
    const audioTimer = setTimeout(playChime, 200);

    // Auto complete the intro after 1.5 seconds
    const exitTimer = setTimeout(onComplete, 1600);

    return () => {
      clearTimeout(audioTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-background text-foreground overflow-hidden select-none"
    >
      {/* Glow particle behind the hands */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: [0.3, 0.6, 0.4], scale: [1, 1.2, 1.1] }}
        transition={{ duration: 1.5, ease: "easeInOut", repeat: 0 }}
        className="absolute w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"
      />

      <div className="relative flex flex-col items-center z-10">
        {/* Hands Container - flex gap-0 ensures precise contact of bounding boxes */}
        <div className="relative flex items-center justify-center gap-0 h-48 mb-10">
          {/* Left Hand */}
          <motion.div
            initial={{ x: -120, y: 15, rotate: -35, opacity: 0 }}
            animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.85, ease: [0.25, 1, 0.5, 1] }}
          >
            <LeftHand />
          </motion.div>

          {/* Right Hand (Perfect Symmetrical Mirror) */}
          <motion.div
            initial={{ x: 120, y: 15, rotate: 35, opacity: 0 }}
            animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.85, ease: [0.25, 1, 0.5, 1] }}
            style={{ scaleX: -1 }}
          >
            <LeftHand />
          </motion.div>
        </div>

        {/* Spiritual Greeting Text */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="flex flex-col items-center gap-1.5 text-center"
        >
          <span className="text-3xl sm:text-4xl font-heading font-light tracking-[0.3em] text-foreground/90">
            नमस्ते
          </span>
          <span className="text-[10px] font-bold text-primary tracking-[0.45em] uppercase opacity-75 mt-1">
            Namaste
          </span>
        </motion.div>
      </div>

      {/* Skip Button */}
      <button 
        onClick={onComplete}
        className="absolute bottom-10 px-4 py-1.5 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 text-[9px] uppercase font-bold tracking-widest text-primary/80 transition-all active:scale-95 z-20"
      >
        Skip Intro
      </button>
    </motion.div>
  );
}
