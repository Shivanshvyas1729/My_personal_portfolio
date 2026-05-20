import { portfolioData as initialData, hasContent } from "@/data/portfolioData";
import { useCMSData } from "@/context/CMSContext";
import { motion } from "framer-motion";
import { useRef, useState } from "react";

const TiltCard = ({ 
  cat, 
  index, 
  hoveredIndex, 
  setHoveredIndex,
  selectedIndex,
  setSelectedIndex,
  delay
}: { 
  cat: any; 
  index: number; 
  hoveredIndex: number | null; 
  setHoveredIndex: (idx: number | null) => void;
  selectedIndex: number | null;
  setSelectedIndex: (idx: number | null) => void;
  delay: number;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [centerShift, setCenterShift] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const isHovered = hoveredIndex === index;
  const isSelected = selectedIndex === index;
  const isActive = isSelected || (selectedIndex === null && isHovered);
  const isAnyActive = selectedIndex !== null || hoveredIndex !== null;
  const isInactive = isAnyActive && !isActive;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Position of cursor relative to card
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Percentages for spotlight gradient (0% to 100%)
    const pctX = (x / width) * 100;
    const pctY = (y / height) * 100;
    setMousePos({ x: pctX, y: pctY });

    // Tilt degree calculations (max 18 degrees)
    const tiltX = ((y / height) - 0.5) * -18; // Y axis rotation
    const tiltY = ((x / width) - 0.5) * 18;   // X axis rotation
    setTilt({ x: tiltX, y: tiltY });

    // Magnetic pull toward parent grid center
    const parent = cardRef.current.parentElement?.parentElement; // Grid container
    if (parent) {
      const parentRect = parent.getBoundingClientRect();
      const cardCenterX = rect.left + width / 2;
      const cardCenterY = rect.top + height / 2;
      
      const parentCenterX = parentRect.left + parentRect.width / 2;
      const parentCenterY = parentRect.top + parentRect.height / 2;

      // Base shift delta
      const shiftX = (parentCenterX - cardCenterX) * 0.15;
      const shiftY = (parentCenterY - cardCenterY) * 0.05;
      setCenterShift({ x: shiftX, y: shiftY });
    }
  };

  const handleMouseEnter = () => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setTilt({ x: 0, y: 0 });
    setCenterShift({ x: 0, y: 0 });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex(isSelected ? null : index);
  };

  // Determine standard states
  const scale = isSelected 
    ? 1.4 // Maximum zoom when clicked/selected
    : isHovered && selectedIndex === null 
      ? 1.3 // Cinematic zoom on hover
      : isInactive 
        ? 0.82 // Shrink background cards to draw attention
        : 1;

  const z = isSelected 
    ? 250 // Selected card floats closest to screen
    : isHovered && selectedIndex === null 
      ? 180 // Hovered card floats up
      : 0;

  const opacity = isActive 
    ? 1 
    : isInactive 
      ? 0.3 // Dim background cards for cinematic contrast
      : 1;

  // Defocus with blur
  const filter = isActive 
    ? "blur(0px)" 
    : isInactive 
      ? "blur(4px)" 
      : "blur(0px)";

  // Pull active card towards the center of the screen
  const pullFactor = isSelected ? 0.55 : 0.25;
  const translateX = isActive ? centerShift.x * (pullFactor / 0.15) : 0;
  const translateY = isActive ? centerShift.y * (pullFactor / 0.05) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.25, 1, 0.5, 1] }}
      style={{ 
        perspective: "1500px", 
        transformStyle: "preserve-3d" 
      }}
      className="h-full"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          translateX,
          translateY,
          scale,
          z,
          opacity,
          filter,
        }}
        transition={{
          type: "spring",
          stiffness: 90,  // Softer spring
          damping: 16,    // Premium inertia cushioning
          mass: 0.9,
        }}
        style={{
          transformStyle: "preserve-3d",
          zIndex: isActive ? 50 : 0,
          transition: "background-color 0.3s, border-color 0.3s, box-shadow 0.3s, filter 0.3s"
        }}
        className="glass-card-hover no-text-effect p-8 h-full flex flex-col border border-border/40 dark:border-white/10 hover:border-primary/40 shadow-xl overflow-visible cursor-pointer select-none relative rounded-2xl bg-card/60 dark:bg-black/30 backdrop-blur-md transition-colors duration-300"
      >
        {/* Dynamic neon shadow expansion underneath */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl z-0 transition-opacity duration-500"
          style={{
            opacity: isActive ? 1 : 0,
            boxShadow: `0 35px 80px -15px hsla(var(--primary), 0.35), 
                        0 0 50px -5px hsla(var(--accent), 0.2),
                        0 0 20px hsla(var(--primary), 0.05)`,
          }}
        />

        {/* 3D Spotlight/Glare Effect */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-2xl z-10"
          style={{
            opacity: isActive ? 1 : 0,
            background: `radial-gradient(circle 280px at ${mousePos.x}% ${mousePos.y}%, hsla(var(--primary), 0.15), hsla(var(--accent), 0.08), transparent)`,
          }}
        />

        {/* Holographic Iridescent light reflection sheet - subtle opacity for light mode */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-2xl z-10"
          style={{
            opacity: isActive ? 0.65 : 0,
            background: `linear-gradient(135deg, 
              rgba(255, 255, 255, 0.15) 0%, 
              hsla(var(--primary), 0.03) 40%, 
              hsla(var(--accent), 0.1) 70%, 
              hsla(var(--primary), 0.1) 100%)`,
            mixBlendMode: "overlay",
          }}
        />

        {/* Card Content with translate-z to pop elements forward */}
        <div 
          className="flex flex-col h-full z-20"
          style={{ transform: "translateZ(60px)", transformStyle: "preserve-3d" }}
        >
          <div className="flex items-center gap-3 mb-6" style={{ transform: "translateZ(30px)" }}>
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse" />
            <h4 className="font-heading font-black text-foreground text-xl md:text-2xl tracking-wide no-text-effect">{cat.title}</h4>
          </div>

          <div className="flex flex-wrap gap-2.5 mt-auto" style={{ transform: "translateZ(40px)" }}>
            {(cat.items || []).map((item: string) => (
              <motion.span
                key={item}
                whileHover={{ 
                  scale: 1.12, 
                  backgroundColor: "hsla(var(--primary), 0.25)",
                  borderColor: "hsla(var(--primary), 0.5)",
                  color: "hsl(var(--accent))",
                  boxShadow: "0 0 15px hsla(var(--primary), 0.15)"
                }}
                transition={{ type: "spring", stiffness: 350, damping: 10 }}
                className="px-3.5 py-1.5 rounded-xl bg-primary/5 dark:bg-primary/10 text-primary dark:text-primary text-[12px] md:text-[13px] font-bold border border-primary/10 dark:border-primary/20 transition-all duration-350 whitespace-nowrap shadow-sm hover:shadow-primary/5 cursor-none no-text-effect"
              >
                {item}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Skills = () => {
  const skills = useCMSData(d => d.skills) || initialData.skills;
  const categories = skills?.categories || initialData.skills.categories;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!hasContent(categories)) return null;

  return (
    <section 
      id="skills" 
      className="section-padding overflow-visible"
      onClick={() => setSelectedIndex(null)}
    >
      <div className="container mx-auto">
        <div className="text-center md:text-left mb-12">
          <h2 className="text-sm font-medium text-primary tracking-widest uppercase mb-2">Skills</h2>
          <h3 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            My <span className="gradient-text">Core Stack</span>
          </h3>
          <p className="text-muted-foreground text-sm max-w-md hidden md:block">
            Hover to explore, or click any stack to focus/maximize in 3D perspective.
          </p>
        </div>

        <div
          className="grid gap-8 relative"
          style={{ 
            gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 280px), 1fr))`,
            perspective: "2000px",
            transformStyle: "preserve-3d"
          }}
        >
          {(categories || []).map((cat, i) => (
            <TiltCard 
              key={cat.title}
              cat={cat} 
              index={i} 
              hoveredIndex={hoveredIndex} 
              setHoveredIndex={setHoveredIndex}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              delay={i * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
