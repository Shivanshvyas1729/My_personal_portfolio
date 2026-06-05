import { useState, useRef } from "react";
import { getFeaturedProjects, portfolioData as initialData } from "@/data/portfolioData";
import { useCMSData } from "@/context/CMSContext";
import AnimatedSection from "./AnimatedSection";
import ProjectCard from "./ProjectCard";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const Projects = () => {
  const navigate = useNavigate();
  const currentData = useCMSData(d => d) || initialData;
  const featured = getFeaturedProjects(currentData);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const isMouseDownRef = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const scrollStartPos = useRef(0);
  const [isGrabbed, setIsGrabbed] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const { scrollLeft } = containerRef.current;
      const isMobile = window.innerWidth < 768;
      const scrollAmount = isMobile 
        ? (direction === "left" ? -280 : 280)
        : (direction === "left" ? -404 : 404);
      
      containerRef.current.scrollTo({
        left: scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    
    // Don't drag if click starts on interactive element
    if ((e.target as HTMLElement).closest("a") || (e.target as HTMLElement).closest("button")) {
      return;
    }

    setIsGrabbed(true);
    isMouseDownRef.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    scrollStartPos.current = containerRef.current?.scrollLeft || 0;
    isDraggingRef.current = false;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !containerRef.current) return;
    
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      isDraggingRef.current = true;
      containerRef.current.scrollLeft = scrollStartPos.current - dx;
    }
  };

  const onMouseUp = () => {
    setIsGrabbed(false);
    isMouseDownRef.current = false;
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 100);
  };

  const onMouseLeave = () => {
    setIsGrabbed(false);
    isMouseDownRef.current = false;
    isDraggingRef.current = false;
  };

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
      <div className="container mx-auto px-4 md:px-8">
        <AnimatedSection>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-sm font-medium text-primary tracking-widest uppercase mb-2">Projects</h2>
              <h3 className="text-3xl md:text-4xl font-heading font-bold mb-0">
                Featured <span className="gradient-text">Work</span>
              </h3>
            </div>
            {/* Navigation buttons */}
            <div className="hidden md:flex gap-3">
              <button
                onClick={() => scroll("left")}
                className="p-2.5 rounded-full border border-border bg-card/80 backdrop-blur-md text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 shadow-sm cursor-pointer"
                aria-label="Scroll Left"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-2.5 rounded-full border border-border bg-card/80 backdrop-blur-md text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 shadow-sm cursor-pointer"
                aria-label="Scroll Right"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </AnimatedSection>

        {/* Carousel Viewport Container (stretches to edge on mobile/tablet/desktop) */}
        <div className="relative -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-12 overflow-hidden mb-8">
          <div
            ref={containerRef}
            className={`flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory md:snap-none py-8 px-4 sm:px-6 md:px-8 lg:px-12 select-none ${
              isGrabbed ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
          >
            {/* Lead spacer for centering on mobile */}
            <div className="w-[calc((100vw-280px)/2-16px)] xs:w-[calc((100vw-320px)/2-16px)] sm:w-[calc((100vw-350px)/2-24px)] md:hidden shrink-0" />
            
            {featured.map((p, i) => (
              <div 
                key={p.id} 
                className="w-[280px] xs:w-[320px] sm:w-[350px] md:w-[380px] flex-shrink-0 h-full snap-center md:snap-align-none transition-all duration-300 md:hover:scale-[1.03] md:hover:-translate-y-2 py-2"
              >
                <div className="pointer-events-auto h-full">
                  <ProjectCard 
                    project={p} 
                    index={i} 
                    disableInViewAnimation={true}
                    onClick={() => {
                      if (isDraggingRef.current) return;
                      navigate(`/project/${p.id}`);
                    }}
                  />
                </div>
              </div>
            ))}

            {/* Trail spacer for centering on mobile */}
            <div className="w-[calc((100vw-280px)/2-16px)] xs:w-[calc((100vw-320px)/2-16px)] sm:w-[calc((100vw-350px)/2-24px)] md:hidden shrink-0" />
          </div>
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
