import { getFeaturedProjects, hasContent } from "@/data/portfolioData";
import AnimatedSection from "./AnimatedSection";
import ProjectCard from "./ProjectCard";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Projects = () => {
  const featured = getFeaturedProjects();
  if (!hasContent(featured)) {
    return (
      <section id="projects" className="section-padding">
        <div className="container mx-auto text-center">
          <h3 className="text-2xl font-heading text-muted-foreground">Projects coming soon...</h3>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="section-padding">
      <div className="container mx-auto">
        <AnimatedSection>
          <h2 className="text-sm font-medium text-primary tracking-widest uppercase mb-2">Projects</h2>
          <h3 className="text-3xl md:text-4xl font-heading font-bold mb-12">
            Featured <span className="gradient-text">Work</span>
          </h3>
        </AnimatedSection>

        <div
          className="grid gap-6 mb-8"
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${featured.length <= 3 ? "340px" : "300px"}), 1fr))`,
          }}
        >
          {featured.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>

        <AnimatedSection className="text-center">
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
