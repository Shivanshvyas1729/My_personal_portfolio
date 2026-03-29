import { portfolioData } from "@/data/portfolioData";
import AnimatedSection from "./AnimatedSection";
import { Mail, Phone, Linkedin, Github, Send } from "lucide-react";
import { useState, FormEvent } from "react";

const Contact = () => {
  const { personal } = portfolioData;
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const mailto = `mailto:${personal.email}?subject=Portfolio Contact from ${form.name}&body=${encodeURIComponent(form.message)}`;
    window.open(mailto);
  };

  const links = [
    personal.email && { icon: Mail, label: personal.email, href: `mailto:${personal.email}` },
    personal.phone && { icon: Phone, label: personal.phone, href: `tel:${personal.phone}` },
    personal.linkedin && { icon: Linkedin, label: "LinkedIn", href: personal.linkedin },
    personal.github && { icon: Github, label: "GitHub", href: personal.github },
  ].filter(Boolean) as { icon: typeof Mail; label: string; href: string }[];

  return (
    <section id="contact" className="section-padding">
      <div className="container mx-auto">
        <AnimatedSection>
          <h2 className="text-sm font-medium text-primary tracking-widest uppercase mb-2">Contact</h2>
          <h3 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Let's <span className="gradient-text">Connect</span>
          </h3>
          <p className="text-muted-foreground max-w-xl mb-12">
            Let's build something impactful together.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-12">
          <AnimatedSection>
            <div className="space-y-4">
              {links.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card-hover p-4 flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors text-sm">{label}</span>
                </a>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
              {(["name", "email"] as const).map((field) => (
                <div key={field}>
                  <label className="text-sm text-muted-foreground capitalize mb-1 block">{field}</label>
                  <input
                    type={field === "email" ? "email" : "text"}
                    required
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </div>
              ))}
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Message</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.5)] hover:scale-[1.02] transition-all duration-300"
              >
                Send Message <Send size={16} />
              </button>
            </form>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default Contact;
