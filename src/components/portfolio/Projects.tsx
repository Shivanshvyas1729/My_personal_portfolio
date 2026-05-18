import { useRef, useState, useEffect } from "react";
import { getFeaturedProjects, portfolioData as initialData } from "@/data/portfolioData";
import { useCMSData } from "@/context/CMSContext";
import AnimatedSection from "./AnimatedSection";
import ProjectCard from "./ProjectCard";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Projects = () => {
  const currentData = useCMSData(d => d) || initialData;
  const featured = getFeaturedProjects(currentData);
  const containerRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });

  useEffect(() => {
    const updateConstraints = () => {
      if (containerRef.current && constraintsRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const scrollWidth = constraintsRef.current.scrollWidth;
        // The left constraint is the difference (negative) between the scroll width and container width
        const left = Math.min(0, containerWidth - scrollWidth - 48); // includes margins
        setDragConstraints({ left, right: 0 });
      }
    };

    updateConstraints();
    window.addEventListener("resize", updateConstraints);
    // Double-check layouts after brief render tick
    const timer1 = setTimeout(updateConstraints, 100);
    const timer2 = setTimeout(updateConstraints, 500);

    return () => {
      window.removeEventListener("resize", updateConstraints);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [featured]);

  if (!featured || featured.length === 0) {
    return (
      <section id="projects" className="section-padding">
        <div className="container mx-auto text-center">
          <AnimatedSection>
            <h2 className="text-sm font-medium text-primary tracking-widest uppercase mb-2">Projects</h2>
            <h3 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              Featured <span className="gradient-text">Work</span>
            </h3>
            <div className="glass-card p-12 rounded-2xl max-w-2xl mx-auto border border-border/50">
              <p className="text-lg text-foreground font-medium mb-2">No featured projects found.</p>
              <p className="text-muted-foreground mb-6">The portfolio configuration currently has no featured projects selected.</p>
              <Link 
                to="/projects" 
                className="inline-flex px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                View All Projects
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="section-padding overflow-hidden">
      <div className="container mx-auto" ref={containerRef}>
        <AnimatedSection>
          <h2 className="text-sm font-medium text-primary tracking-widest uppercase mb-2">Projects</h2>
          <h3 className="text-3xl md:text-4xl font-heading font-bold mb-12">
            Featured <span className="gradient-text">Work</span>
          </h3>
        </AnimatedSection>

        <div className="relative -mx-6 px-6 overflow-hidden group mb-8">
          {/* Subtle Fade Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />

          {/* Draggable Track Container */}
          <motion.div
            ref={constraintsRef}
            className="flex gap-6 w-max cursor-grab active:cursor-grabbing py-4"
            drag="x"
            dragConstraints={dragConstraints}
            dragElastic={0.15}
            whileTap={{ cursor: "grabbing" }}
            style={{ 
              willChange: 'transform',
              contain: 'layout paint style'
            }}
          >
            {featured.map((p, i) => (
              <div 
                key={p.id} 
                className="w-[300px] sm:w-[350px] md:w-[380px] flex-shrink-0 select-none h-full"
              >
                <div className="pointer-events-auto h-full">
                  <ProjectCard 
                    project={p} 
                    index={i} 
                    disableInViewAnimation={true} // Bypasses expensive intersection transitions for butter-smooth dragging
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <AnimatedSection className="text-center mt-6">
          <Link
            to="/projects"
            className="group inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            View All Projects <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default Projects;
