import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const AnimatedSection = ({ children, className = "", delay = 0 }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "100px" }}
    transition={{ duration: 0.4, delay, ease: [0.25, 1, 0.5, 1] }} // Fast, responsive ease
    className={`transform-gpu will-change-[transform,opacity] ${className}`}
    style={{ contain: 'layout paint style' }}
  >
    {children}
  </motion.div>
);

export default AnimatedSection;
