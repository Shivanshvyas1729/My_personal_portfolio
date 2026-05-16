import { portfolioData as initialData, hasContent } from "@/data/portfolioData";
import { useCMSData } from "@/context/CMSContext";
import AnimatedSection from "./AnimatedSection";
import { motion } from "framer-motion";

const Skills = () => {
  const skills = useCMSData(d => d.skills) || initialData.skills;
  const categories = skills?.categories || initialData.skills.categories;

  if (!hasContent(categories)) return null;

  const isCompact = categories.length > 4;

  return (
    <section id="skills" className="section-padding">
      <div className="container mx-auto">
        <AnimatedSection>
          <h2 className="text-sm font-medium text-primary tracking-widest uppercase mb-2">Skills</h2>
          <h3 className="text-3xl md:text-4xl font-heading font-bold mb-12">
            My <span className="gradient-text">Core Stack</span>
          </h3>
        </AnimatedSection>

        <div className="relative -mx-6 px-6 overflow-hidden group">
          {/* Subtle Fade Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <motion.div
            className="flex gap-6 w-max cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: -1000, right: 0 }} // Dynamic constraints would be better but this works for feel
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 50,
              ease: "linear",
              repeat: Infinity,
            }}
            whileHover={{ transition: { duration: 100 } }} // Slow down on hover
            whileTap={{ cursor: "grabbing" }}
          >
            {/* Double the categories for seamless looping */}
            {[...categories, ...categories].map((cat, i) => (
              <div 
                key={`${cat.title}-${i}`} 
                className="w-[280px] md:w-[320px] flex-shrink-0 h-full py-4 select-none"
              >
                <div className="glass-card-hover p-6 h-full flex flex-col border border-border/50 hover:border-primary/30 transition-colors shadow-sm pointer-events-none">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <h4 className="font-heading font-semibold text-foreground">{cat.title}</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(cat.items || []).map((item) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 rounded-lg bg-primary/5 text-primary text-[12px] font-medium border border-primary/10 no-text-effect whitespace-nowrap"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
