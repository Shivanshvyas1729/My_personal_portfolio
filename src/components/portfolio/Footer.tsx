import { portfolioData } from "@/data/portfolioData";

const Footer = () => (
  <footer className="border-t border-border py-8 px-4">
    <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-muted-foreground text-sm">
        © {new Date().getFullYear()} {portfolioData.personal.name}. All rights reserved.
      </p>
      <div className="flex gap-4">
        {portfolioData.personal.github && (
          <a href={portfolioData.personal.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground text-sm transition-colors">GitHub</a>
        )}
        {portfolioData.personal.linkedin && (
          <a href={portfolioData.personal.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground text-sm transition-colors">LinkedIn</a>
        )}
      </div>
    </div>
  </footer>
);

export default Footer;
