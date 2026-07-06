import { portfolioData as initialData, hasContent } from "@/data/portfolioData";
import { useCMSData } from "@/context/CMSContext";
import AnimatedSection from "./AnimatedSection";
import { Briefcase } from "lucide-react";
import { motion } from "framer-motion";

const Experience = () => {
  const experience = useCMSData(d => d.experience) || initialData.experience;
  
  if (!hasContent(experience)) return null;

  const cols = experience.length === 1 ? "max-w-lg mx-auto" : "";

  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <AnimatedSection>
          <h2 className="text-sm font-medium text-primary tracking-widest uppercase mb-8">Experience</h2>
          <div
            className={cols || "grid gap-6"}
            style={!cols ? { gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 340px), 1fr))` } : undefined}
          >
            {(experience || []).map((exp, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <motion.div 
                  style={{ transition: "all 0.4s cubic-bezier(0.25, 1, 0.5, 1)" }}
                  className="glass-card-hover p-6 h-full cursor-pointer hover:scale-[1.04] hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Briefcase className="text-primary" size={22} />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-foreground">{exp.title}</h3>
                      <p className="text-primary text-sm">{exp.company}</p>
                      <span className="text-muted-foreground text-xs">{exp.duration}</span>
                      <p className="text-muted-foreground text-sm mt-3">{exp.description}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default Experience;
