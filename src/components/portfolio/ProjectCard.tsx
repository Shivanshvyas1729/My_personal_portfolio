import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import type { Project } from "@/data/portfolioData";
import { Link } from "react-router-dom";

interface Props {
  project: Project;
  index: number;
}

const ProjectCard = ({ project, index }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    whileHover={{ y: -6 }}
    className="glass-card-hover p-6 flex flex-col h-full group"
  >
    <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full self-start mb-3 font-medium">
      {project.category}
    </span>
    <Link to={`/project/${project.id}`}>
      <h3 className="font-heading font-semibold text-foreground text-lg mb-2 group-hover:text-primary transition-colors">
        {project.title}
      </h3>
    </Link>
    <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">{project.description}</p>

    {project.impact && (
      <p className="text-xs text-accent mb-4 italic">⚡ {project.impact}</p>
    )}

    <div className="flex flex-wrap gap-1.5 mb-4">
      {project.tech.map((t) => (
        <span key={t} className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>
      ))}
    </div>

    <div className="flex gap-3 mt-auto">
      {project.github && (
        <a href={project.github} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Github size={15} /> GitHub
        </a>
      )}
      {project.live && (
        <a href={project.live} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ExternalLink size={15} /> Live
        </a>
      )}
    </div>
  </motion.div>
);

export default ProjectCard;
