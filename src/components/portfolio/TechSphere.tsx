import { useRef, useMemo, Suspense, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, Float, OrbitControls, Billboard } from "@react-three/drei";
import { portfolioData as initialData } from "@/data/portfolioData";
import { useCMSData } from "@/context/CMSContext";
import * as THREE from "three";
import AnimatedSection from "./AnimatedSection";
import { Code2, Cpu, Database, Cloud, Layers, Terminal } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface TechLabelProps {
  text: string;
  position: [number, number, number];
  index: number;
  total: number;
}

const TechLabel = ({ text, position, index, total }: TechLabelProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * 0.15 + (index / total) * Math.PI * 2;
    const r = 0.1;
    
    // Floating movement within its position
    ref.current.position.x = position[0] + Math.sin(t) * r;
    ref.current.position.y = position[1] + Math.cos(t * 1.2) * r;
    ref.current.position.z = position[2] + Math.sin(t * 0.8) * r;
  });

  return (
    <Billboard ref={ref} position={position} follow={true} lockX={false} lockY={false} lockZ={false}>
      <Text
        fontSize={0.22}
        color={isDark ? "#93c5fd" : "#2563eb"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor={isDark ? "#1e3a8a" : "#dbeafe"}
      >
        {text}
      </Text>
    </Billboard>
  );
};

interface SynapseLinesProps {
  positions: [number, number, number][];
  tools: string[];
  connections?: string[][];
}

const SynapseLines = ({ positions, tools, connections }: SynapseLinesProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const ref = useRef<THREE.LineSegments>(null);
  
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const points: number[] = [];
    
    const toolToIndexMap = new Map<string, number>();
    tools.forEach((t, i) => toolToIndexMap.set(t.toLowerCase(), i));

    if (connections && connections.length > 0) {
      connections.forEach(([t1, t2]) => {
        const idx1 = toolToIndexMap.get(t1.toLowerCase());
        const idx2 = toolToIndexMap.get(t2.toLowerCase());
        
        if (idx1 !== undefined && idx2 !== undefined) {
          points.push(...positions[idx1]);
          points.push(...positions[idx2]);
        }
      });
    }

    if (points.length === 0) {
      for (let i = 0; i < positions.length; i++) {
        const p1 = new THREE.Vector3(...positions[i]);
        const distances = positions
          .map((p, idx) => ({ idx, dist: p1.distanceTo(new THREE.Vector3(...p)) }))
          .filter(d => d.idx !== i)
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 2);
          
        distances.forEach(d => {
          points.push(...positions[i]);
          points.push(...positions[d.idx]);
        });
      }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return geometry;
  }, [positions, tools, connections]);

  useFrame(({ clock }) => {
    if (ref.current) {
      const material = ref.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.08 + Math.sin(clock.getElapsedTime() * 1.5) * 0.04;
    }
  });

  return (
    <lineSegments ref={ref} geometry={lineGeometry}>
      <lineBasicMaterial color={isDark ? "#3b82f6" : "#2563eb"} transparent opacity={0.12} />
    </lineSegments>
  );
};

const DataField = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const ref = useRef<THREE.Points>(null);
  
  const [positions] = useState(() => {
    const pos = new Float32Array(300 * 3);
    for(let i=0; i<300; i++) {
      const r = 4.5;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i*3+2] = r * Math.cos(phi);
    }
    return pos;
  });

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y -= delta / 25;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={isDark ? "#60a5fa" : "#3b82f6"}
        size={0.015}
        sizeAttenuation={true}
        transparent
        opacity={0.3}
        depthWrite={false}
      />
    </points>
  );
};

const SphereShell = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[3.6, 24, 24]} />
      <meshBasicMaterial color={isDark ? "#3b82f6" : "#2563eb"} wireframe opacity={0.03} transparent />
    </mesh>
  );
};

const RobotAvatar = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const groupRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 1.2) * 0.08;
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.4;
    }
    if (haloRef.current) {
      haloRef.current.rotation.z = clock.getElapsedTime() * 1.5;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={haloRef} rotation={[Math.PI / 2.5, 0, 0]} position={[0, 0.1, 0]}>
        <torusGeometry args={[1.2, 0.01, 16, 100]} />
        <meshBasicMaterial color={isDark ? "#3b82f6" : "#2563eb"} transparent opacity={0.2} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color={isDark ? "#0f172a" : "#f1f5f9"} metalness={1} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.46]}>
        <planeGeometry args={[0.7, 0.7]} />
        <meshBasicMaterial color={isDark ? "#1e293b" : "#e2e8f0"} />
      </mesh>
      <mesh position={[-0.2, 0.1, 0.47]}>
        <planeGeometry args={[0.18, 0.04]} />
        <meshBasicMaterial color={isDark ? "#60a5fa" : "#3b82f6"} />
      </mesh>
      <mesh position={[0.2, 0.1, 0.47]}>
        <planeGeometry args={[0.18, 0.04]} />
        <meshBasicMaterial color={isDark ? "#60a5fa" : "#3b82f6"} />
      </mesh>
      <pointLight color={isDark ? "#3b82f6" : "#2563eb"} intensity={isDark ? 2 : 1} distance={2} />
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.05]} />
        <meshBasicMaterial color={isDark ? "#60a5fa" : "#3b82f6"} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.3]} />
        <meshBasicMaterial color={isDark ? "#334155" : "#94a3b8"} />
      </mesh>
    </group>
  );
};

const Scene = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const techStack = useCMSData(d => d.techStack) || initialData.techStack;
  const tools = techStack?.featured || initialData.techStack.featured;
  const groupRef = useRef<THREE.Group>(null);

  const positions = useMemo(() => {
    const count = tools.length;
    return tools.map((_, i) => {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const r = 2.8;
      return [
        r * Math.cos(theta) * Math.sin(phi),
        r * Math.sin(theta) * Math.sin(phi),
        r * Math.cos(phi),
      ] as [number, number, number];
    });
  }, [tools]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0015;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#60a5fa" />
      <DataField />
      <SphereShell />
      <SynapseLines positions={positions} tools={tools} connections={techStack?.connections} />
      <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
        <RobotAvatar />
      </Float>
      {tools.map((tech, i) => (
        <TechLabel key={tech} text={tech} position={positions[i]} index={i} total={tools.length} />
      ))}
    </group>
  );
};

const getTechIcon = (tech: string) => {
  const lower = tech.toLowerCase();
  if (lower.includes('python') || lower.includes('spark') || lower.includes('pandas') || lower.includes('sql') || lower.includes('mongo') || lower.includes('redis')) return <Database className="w-5 h-5" />;
  if (lower.includes('docker') || lower.includes('kubernetes') || lower.includes('aws') || lower.includes('gcp') || lower.includes('linux')) return <Cloud className="w-5 h-5" />;
  if (lower.includes('tensorflow') || lower.includes('pytorch') || lower.includes('opencv') || lower.includes('scikit') || lower.includes('keras')) return <Cpu className="w-5 h-5" />;
  if (lower.includes('langchain') || lower.includes('huggingface') || lower.includes('openai') || lower.includes('airflow') || lower.includes('mlflow')) return <Layers className="w-5 h-5" />;
  if (lower.includes('git') || lower.includes('bash')) return <Terminal className="w-5 h-5" />;
  return <Code2 className="w-5 h-5" />;
};

const TechSphere = () => {
  const techStack = useCMSData(d => d.techStack) || initialData.techStack;
  const allTools = techStack?.all || initialData.techStack.all;
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const gridClass = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

  return (
    <section className="section-padding relative overflow-hidden bg-background">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[160px] -z-10 pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        <AnimatedSection>
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-sm font-bold text-primary tracking-[0.3em] uppercase mb-4 px-4 py-1 bg-primary/10 rounded-full border border-primary/20">
              Expertise Graph
            </h2>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-center mb-6 leading-tight">
              The <span className="gradient-text">Synapse Hub</span>
            </h3>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto text-lg leading-relaxed">
              An interconnected matrix of technologies powering intelligent AI workflows.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <div className="relative w-full h-[350px] md:h-[600px] mb-12 md:mb-20 group">
            <div className={`absolute inset-0 ${isDark ? "bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)]" : "bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12)_0%,transparent_70%)]"} pointer-events-none`} />
            
            <div className="relative z-10 w-full h-full cursor-grab active:cursor-grabbing">
              <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                <Suspense fallback={null}>
                  <Scene />
                  <OrbitControls 
                    enableZoom={false} 
                    enablePan={false} 
                    rotateSpeed={0.5}
                    autoRotate={false}
                    dampingFactor={0.05}
                    enableDamping={true}
                  />
                </Suspense>
              </Canvas>
            </div>
            
            {/* Corner UI Accents */}
            <div className="absolute top-4 left-4 border-l border-t border-primary/30 w-8 h-8 pointer-events-none" />
            <div className="absolute top-4 right-4 border-r border-t border-primary/30 w-8 h-8 pointer-events-none" />
            <div className="absolute bottom-4 left-4 border-l border-b border-primary/30 w-8 h-8 pointer-events-none" />
            <div className="absolute bottom-4 right-4 border-r border-b border-primary/30 w-8 h-8 pointer-events-none" />
          </div>
        </AnimatedSection>

        <AnimatedSection>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div className="max-w-lg">
              <h4 className="text-3xl font-heading font-bold text-foreground mb-3">
                Technical Arsenal
              </h4>
              <p className="text-muted-foreground">
                A comprehensive breakdown of my full stack capabilities and domain expertise.
              </p>
            </div>
            <div className="flex flex-col items-end hidden md:flex">
              <div className="text-4xl font-black text-primary/40 leading-none">01</div>
              <div className="h-px w-24 bg-gradient-to-r from-transparent to-primary mt-2" />
            </div>
          </div>

          {/* Categorized Tabs from CRM */}
          {(() => {
            const skills = useCMSData(d => d.skills) || initialData.skills;
            const categories = skills?.categories || [];
            
            const [activeCategory, setActiveCategory] = useState(categories[0]?.title || "");

            // Auto-fallback if active category disappears
            useEffect(() => {
              if (categories.length > 0 && !categories.find(c => c.title === activeCategory)) {
                setActiveCategory(categories[0].title);
              }
            }, [categories, activeCategory]);

            const activeCatData = categories.find(c => c.title === activeCategory);
            const tools = activeCatData?.items || [];

            return (
              <div className="space-y-8">
                {/* Tab List */}
                <div className="flex overflow-x-auto pb-4 scrollbar-hide gap-2 -mx-4 px-4 md:mx-0 md:px-0 justify-start lg:justify-center">
                  {categories.map(cat => (
                    <button
                      key={cat.title}
                      onClick={() => setActiveCategory(cat.title)}
                      className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                        activeCategory === cat.title 
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105" 
                          : "bg-muted/50 text-muted-foreground border-border/50 hover:border-primary/30 hover:text-primary"
                      }`}
                    >
                      {cat.title}
                    </button>
                  ))}
                </div>

                {/* Tools Grid */}
                <motion.div 
                  key={activeCategory}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`grid gap-4 sm:gap-6 ${gridClass}`}
                >
                  {tools.length > 0 ? tools.map((tech) => (
                    <div 
                      key={tech}
                      className="group relative h-24 sm:h-28 bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all duration-500 hover:-translate-y-1.5 overflow-hidden shadow-sm"
                    >
                      <div className="absolute top-0 right-0 w-12 h-12 bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10 w-9 h-9 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-primary group-hover:scale-110 group-hover:text-white group-hover:bg-primary transition-all duration-300">
                        {getTechIcon(tech)}
                      </div>
                      <span className="relative z-10 text-[11px] sm:text-xs font-semibold text-muted-foreground group-hover:text-foreground tracking-wide text-center transition-colors">
                        {tech}
                      </span>
                    </div>
                  )) : (
                    <div className="col-span-full py-12 text-center text-muted-foreground italic text-sm">
                      {categories.length === 0 ? "No skills defined in CRM" : "Select a category to view technologies"}
                    </div>
                  )}
                </motion.div>
              </div>
            );
          })()}
        </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default TechSphere;
