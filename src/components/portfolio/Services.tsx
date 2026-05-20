import { portfolioData as initialData, hasContent } from "@/data/portfolioData";
import { useCMSData } from "@/context/CMSContext";
import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Brain, BarChart3, Sparkles, Zap, Cog } from "lucide-react";

const iconMap: Record<string, typeof Brain> = { Brain, BarChart3, Sparkles, Zap, Cog };

// ─── Service Tilt Card ───────────────────────────────────────────────────────
const ServiceCard = ({
  service,
  index,
  hoveredIndex,
  setHoveredIndex,
  delay,
}: {
  service: { title: string; description: string; icon?: string };
  index: number;
  hoveredIndex: number | null;
  setHoveredIndex: (idx: number | null) => void;
  delay: number;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [centerShift, setCenterShift] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(hover: none) and (pointer: coarse)").matches || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isHovered = !isMobile && hoveredIndex === index;
  const isAnyHovered = !isMobile && hoveredIndex !== null;
  const isInactive = isAnyHovered && !isHovered;

  const Icon = iconMap[service.icon || "Cog"] || Cog;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Spotlight position as percent
    const pctX = (x / width) * 100;
    const pctY = (y / height) * 100;
    setMousePos({ x: pctX, y: pctY });

    // Tilt — max 12 degrees (gentler than Skills' 18)
    const tiltX = ((y / height) - 0.5) * -12;
    const tiltY = ((x / width) - 0.5) * 12;
    setTilt({ x: tiltX, y: tiltY });

    // Magnetic pull toward grid center
    const parent = cardRef.current.parentElement;
    if (parent) {
      const parentRect = parent.getBoundingClientRect();
      const cardCenterX = rect.left + width / 2;
      const cardCenterY = rect.top + height / 2;
      const parentCenterX = parentRect.left + parentRect.width / 2;
      const parentCenterY = parentRect.top + parentRect.height / 2;

      const shiftX = (parentCenterX - cardCenterX) * 0.10;
      const shiftY = (parentCenterY - cardCenterY) * 0.04;
      setCenterShift({ x: shiftX, y: shiftY });
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile) setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setHoveredIndex(null);
      setTilt({ x: 0, y: 0 });
      setCenterShift({ x: 0, y: 0 });
    }
  };

  // Animation values — less aggressive than Skills
  const scale = isHovered ? 1.15 : isInactive ? 0.93 : 1;
  const z     = isHovered ? 120 : 0;
  const opacity = isHovered ? 1 : isInactive ? 0.55 : 1;
  const filter  = isHovered ? "blur(0px)" : isInactive ? "blur(2px)" : "blur(0px)";

  const translateX = isHovered ? centerShift.x : 0;
  const translateY = isHovered ? centerShift.y : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.25, 1, 0.5, 1] }}
      style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
          stiffness: isMobile ? 150 : 100,
          damping: isMobile ? 20 : 18,
          mass: isMobile ? 0.6 : 0.85,
        }}
        style={{
          transformStyle: "preserve-3d",
          zIndex: isHovered ? 50 : 0,
          transition: "background-color 0.3s, border-color 0.3s, box-shadow 0.3s, filter 0.3s",
        }}
        className={`glass-card-hover no-text-effect p-6 h-full flex flex-col border border-border/40 dark:border-white/10 ${!isMobile && 'hover:border-primary/40'} shadow-xl overflow-visible ${!isMobile ? 'cursor-pointer' : ''} select-none relative rounded-2xl bg-card/60 dark:bg-black/30 backdrop-blur-md transition-colors duration-300 group`}
      >
        {/* Dynamic neon shadow */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl z-0 transition-opacity duration-500"
          style={{
            opacity: isHovered ? 1 : 0,
            boxShadow: `0 30px 70px -15px hsla(var(--primary), 0.3),
                        0 0 40px -5px hsla(var(--accent), 0.18),
                        0 0 16px hsla(var(--primary), 0.04)`,
          }}
        />

        {/* Spotlight / glare */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-2xl z-10"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(circle 220px at ${mousePos.x}% ${mousePos.y}%, hsla(var(--primary), 0.13), hsla(var(--accent), 0.06), transparent)`,
          }}
        />

        {/* Iridescent sheen */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-2xl z-10"
          style={{
            opacity: isHovered ? 0.55 : 0,
            background: `linear-gradient(135deg,
              rgba(255, 255, 255, 0.12) 0%,
              hsla(var(--primary), 0.02) 40%,
              hsla(var(--accent), 0.08) 70%,
              hsla(var(--primary), 0.08) 100%)`,
            mixBlendMode: "overlay",
          }}
        />

        {/* Card content with 3D depth */}
        <div
          className="flex flex-col h-full z-20"
          style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}
        >
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
            style={{ transform: "translateZ(20px)" }}
          >
            <Icon className="text-primary" size={22} />
          </div>

          {/* Title */}
          <h4
            className="font-heading font-semibold text-foreground mb-2 no-text-effect"
            style={{ transform: "translateZ(15px)" }}
          >
            {service.title}
          </h4>

          {/* Description */}
          <p
            className="text-muted-foreground text-sm no-text-effect"
            style={{ transform: "translateZ(10px)" }}
          >
            {service.description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Services Section ────────────────────────────────────────────────────────
const Services = () => {
  const services = useCMSData(d => d.services) || initialData.services;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!hasContent(services)) return null;

  return (
    <section id="services" className="section-padding overflow-visible">
      <div className="container mx-auto">
        <div className="mb-12">
          <h2 className="text-sm font-medium text-primary tracking-widest uppercase mb-2">Services</h2>
          <h3 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            What I <span className="gradient-text">Can Build</span>
          </h3>
          <p className="text-muted-foreground max-w-xl">
            Have an idea? I can build it — from concept to deployment.
          </p>
        </div>

        <div
          className="grid gap-6 relative"
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 280px), 1fr))`,
            perspective: "1600px",
            transformStyle: "preserve-3d",
          }}
        >
          {(services || []).map((service, i) => (
            <ServiceCard
              key={service.title}
              service={service}
              index={i}
              hoveredIndex={hoveredIndex}
              setHoveredIndex={setHoveredIndex}
              delay={i * 0.08}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
