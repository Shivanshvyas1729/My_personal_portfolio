import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, Float } from "@react-three/drei";
import { portfolioData } from "@/data/portfolioData";
import * as THREE from "three";
import AnimatedSection from "./AnimatedSection";

interface TechLabelProps {
  text: string;
  position: [number, number, number];
  index: number;
  total: number;
}

const TechLabel = ({ text, position, index, total }: TechLabelProps) => {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * 0.3 + (index / total) * Math.PI * 2;
    const r = 2;
    ref.current.position.x = position[0] + Math.sin(t) * r * 0.3;
    ref.current.position.y = position[1] + Math.cos(t * 0.7) * r * 0.2;
    ref.current.position.z = position[2] + Math.sin(t * 0.5) * r * 0.3;
  });

  return (
    <Float speed={1.5} rotationIntensity={0} floatIntensity={0.5}>
      <group ref={ref} position={position}>
        <Text
          fontSize={0.22}
          color="#60a5fa"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2"
        >
          {text}
        </Text>
      </group>
    </Float>
  );
};

const SphereWireframe = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.002;
      ref.current.rotation.x += 0.001;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2.8, 24, 24]} />
      <meshBasicMaterial color="#3b82f6" wireframe opacity={0.08} transparent />
    </mesh>
  );
};

const Scene = () => {
  const { techStack } = portfolioData;

  const positions = useMemo(() => {
    const count = techStack.length;
    return techStack.map((_, i) => {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const r = 2.2;
      return [
        r * Math.cos(theta) * Math.sin(phi),
        r * Math.sin(theta) * Math.sin(phi),
        r * Math.cos(phi),
      ] as [number, number, number];
    });
  }, [techStack]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <SphereWireframe />
      {techStack.map((tech, i) => (
        <TechLabel key={tech} text={tech} position={positions[i]} index={i} total={techStack.length} />
      ))}
    </>
  );
};

const TechSphere = () => (
  <section className="section-padding">
    <div className="container mx-auto">
      <AnimatedSection>
        <h2 className="text-sm font-medium text-primary tracking-widest uppercase mb-2 text-center">Tech Stack</h2>
        <h3 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4">
          My <span className="gradient-text">Technology Ecosystem</span>
        </h3>
        <p className="text-muted-foreground text-center max-w-xl mx-auto mb-8">
          Technologies I work with to build intelligent systems
        </p>
      </AnimatedSection>
      <AnimatedSection>
        <div className="w-full aspect-square max-w-lg mx-auto">
          <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
            <Scene />
          </Canvas>
        </div>
      </AnimatedSection>
    </div>
  </section>
);

export default TechSphere;
