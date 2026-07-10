import { z } from "zod";

// Base common types
export const CloudinaryMediaSchema = z.object({
  secureUrl: z.string().url(),
  publicId: z.string(),
  resourceType: z.enum(["image", "video", "raw"]).default("image")
});

const imageSchema = z.union([
  CloudinaryMediaSchema,
  z.object({
    type: z.enum(["local", "url"]),
    value: z.string().url("Must be a valid URL").or(z.string().min(1, "Required")),
    position: z.enum(["left", "right", "center"]).default("right"),
    objectPosition: z.string().optional().default("50% 50%"),
  }).passthrough(),
  z.string().url("Must be a valid URL").or(z.string()), // allow ANY string including empty (cleared fields)
  z.null(),                                            // allow null (YAML null / cleared)
  z.undefined(),                                       // allow undefined
]);


// ─── PORTFOLIO SCHEMAS ───

export const HomeSchema = z.object({
  featuredProjectsCount: z.number().min(0).default(4),
});

export const PersonalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string(),
  linkedin: z.string().url(),
  github: z.string().url(),
  location: z.string(),
  profileImage: imageSchema,
});

export const HeroSchema = z.object({
  headline: z.array(z.string()),
  description: z.string().min(1, "Hero description required"),
  ctas: z.array(z.object({
    label: z.string(),
    link: z.string()
  })),
});

export const StatsSchema = z.object({
  projectsCount: z.number().min(0).default(0),
  experienceCount: z.number().min(0).default(0),
});

export const AboutSchema = z.object({
  description: z.string().min(1, "Description is required"),
  marqueeTexts: z.array(z.string()),
  certifications: z.array(z.string()),
});

export const EducationSchema = z.array(z.object({
  degree: z.string().min(1),
  institution: z.string().min(1),
  year: z.string().min(1),
  description: z.string().optional(),
}));

export const ExperienceSchema = z.array(z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  duration: z.string().min(1),
  description: z.string(),
}));

export const SkillsSchema = z.object({
  categories: z.array(z.object({
    title: z.string().min(1),
    items: z.array(z.string()),
  }))
});

export const TechStackSchema = z.object({
  featured: z.array(z.string()),
  all: z.array(z.string()),
  connections: z.array(z.array(z.string())).optional(),
});

export const ServicesSchema = z.array(z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().optional(),
}));

export const ResumeCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Must be a valid URL"),
  visible: z.boolean().default(true),
});

export const ResumeSchema = z.object({
  url: z.string().url("Must be a valid URL").optional(),
  categories: z.array(ResumeCategorySchema).default([]),
});

export const GlobalSettingsSchema = z.object({
  ropeLightColors: z.array(z.string()).min(1).optional(),
  ropeLightSpeed: z.number().min(0.1).optional(),
  ropeLightThickness: z.number().min(0.5).optional(),
  ropeLightGlowIntensity: z.number().min(0).optional(),
  sharpLightSpeed: z.number().min(0.1).optional(),

  // Independent dark and light mode wash settings
  ropeLightColorsLight: z.array(z.string()).optional(),
  ropeLightColorsDark: z.array(z.string()).optional(),
  ropeLightSpeedLight: z.number().min(0.1).optional(),
  ropeLightSpeedDark: z.number().min(0.1).optional(),
  ropeLightThicknessLight: z.number().min(0.5).optional(),
  ropeLightThicknessDark: z.number().min(0.5).optional(),
  ropeLightGlowIntensityLight: z.number().min(0).optional(),
  ropeLightGlowIntensityDark: z.number().min(0).optional(),

  ropeLightColorLight: z.string().optional(),
  ropeLightColorDark: z.string().optional(),
  ropeLightAccentLight: z.string().optional(),
  ropeLightAccentDark: z.string().optional(),

  // Sharp line edge light controls for dark and light mode
  sharpLightColorsLight: z.array(z.string()).optional(),
  sharpLightColorsDark: z.array(z.string()).optional(),
  sharpLightThicknessLight: z.number().min(0.5).optional(),
  sharpLightThicknessDark: z.number().min(0.5).optional(),
  sharpLightSpeedLight: z.number().min(0.1).optional(),
  sharpLightSpeedDark: z.number().min(0.1).optional(),

  textHoverColors: z.array(z.string()).optional(),
  textTransitionSpeed: z.string().optional(),
  textLeaveSpeed: z.string().optional(),
  textAnimationSpeed: z.string().optional(),
  textBaseOpacity: z.number().min(0).max(1).optional(),
  textGlowIntensity: z.number().optional(),
  themePrimaryColor: z.string().optional(),
  themeBackgroundColor: z.string().optional(),
  themeAccentColor: z.string().optional(),
  themeFontFamily: z.string().optional(),
  customCursorEnabled: z.boolean().optional(),
  edgeLightsEnabled: z.boolean().optional(),
  smoothScrollEnabled: z.boolean().optional(),
  chatbotWorkMode: z.enum(['offline', 'online', 'auto']).optional(),
  chatbotMaxTokens: z.number().min(1).max(4000).optional(),
  chatbotModel: z.string().optional(),
  chatbotBaseUrl: z.string().optional(),

  // ─── Intro / Transition Settings ───
  introEnabled: z.boolean().optional(),
  introStyle: z.enum(['namaste', 'pulse', 'academic', 'terminal', 'minimal', 'creative']).optional(),
  introPrimaryText: z.string().optional(),
  introSubtitle: z.string().optional(),
  introTagline: z.string().optional(),
  introColors: z.array(z.string()).optional(),
  introDuration: z.number().min(1000).max(8000).optional(),
});

// Used if storing entire portfolio.yaml 
export const PortfolioSchema = z.object({
  home: HomeSchema.optional(),
  settings: GlobalSettingsSchema.optional(),
  personal: PersonalSchema.optional(),
  hero: HeroSchema.optional(),
  stats: StatsSchema.optional(),
  about: AboutSchema.optional(),
  education: EducationSchema.optional(),
  experience: ExperienceSchema.optional(),
  skills: SkillsSchema.optional(),
  techStack: TechStackSchema.optional(),
  services: ServicesSchema.optional(),
  resume: ResumeSchema.optional(),
});

export const ProjectSchema = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().min(1, "Title is required"),
  category: z.array(z.string()).optional().default([]),
  description: z.string().min(1, "Description is required"),
  tech: z.array(z.string()).optional().default([]),
  github: z.string().optional().default(""),
  live: z.string().optional().default(""),
  featured: z.boolean().optional().default(false),
  impact: z.string().optional(),
  domain: z.string().optional(),
  metrics: z.record(z.union([z.string(), z.number()])).optional(),

  // Media: type is a dropdown chooser, url and caption are optional
  media: z.array(z.object({
    secureUrl: z.string().optional(),
    publicId: z.string().optional(),
    resourceType: z.enum(["image", "video", "raw"]).optional(),
    type: z.enum(["image", "video"]).default("image"), // legacy
    url: z.string().optional(), // legacy
    caption: z.string().optional()
  })).optional(),

  // Data science / extended fields - all optional
  problem_statement: z.string().optional(),
  business_problem: z.string().optional(),
  learning_outcomes: z.array(z.string()).optional(),
  architecture: z.string().optional(),
  architectureImage: imageSchema.optional().nullable(),
  resources: z.array(z.object({ label: z.string().optional(), url: z.string().optional() })).optional(),
  howItWorks: z.string().optional(),
  objectives: z.array(z.string()).optional(),
  success_criteria: z.array(z.string()).optional(),
  data_sources: z.array(z.string()).optional(),
  data_volume: z.string().optional(),
  class_distribution: z.union([
    z.string(),
    z.array(z.string()),
    z.record(z.union([z.string(), z.number()]))
  ]).optional(),
  target_variable: z.string().optional(),
  features: z.array(z.string()).optional(),
  model_inputs: z.array(z.string()).optional(),
  model_outputs: z.array(z.string()).optional(),
  preprocessing: z.array(z.string()).optional(),
  feature_engineering: z.array(z.string()).optional(),
  modeling: z.array(z.string()).optional(),
  hyperparameters: z.array(z.string()).optional(),
  evaluation_metrics: z.array(z.string()).optional(),
  validation_strategy: z.string().optional(),
  explainability: z.string().optional(),
  training_environment: z.union([z.string(), z.array(z.string())]).optional(),
  inference_pipeline: z.union([z.string(), z.array(z.string())]).optional(),
  deployment: z.string().optional(),
  monitoring: z.union([z.string(), z.array(z.string())]).optional(),
  versioning: z.union([z.string(), z.array(z.string())]).optional(),
  risks: z.array(z.string()).optional(),
  ethics: z.array(z.string()).optional(),
  privacy: z.array(z.string()).optional(),
  known_limitations: z.array(z.string()).optional(),
  future_improvements: z.array(z.string()).optional(),
  open_resources: z.array(z.object({ label: z.string().optional(), url: z.string().optional() })).optional(),
  
  knowledge_overrides: z.array(
    z.object({
      id: z.string().min(1, "Override Term ID is required")
    }).passthrough()
  ).optional().default([]),
}).passthrough();

export const ProjectsArraySchema = z.array(ProjectSchema);

export const BlogSchema = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
  type: z.array(z.string()).optional().default([]),
  date: z.string().optional(),
  featured: z.boolean().optional().default(false),
  draft: z.boolean().optional().default(true),
  readingTime: z.number().optional(),
  link: z.string().optional().default(""),
  linkText: z.string().optional().default(""),
  resources: z.array(z.object({
    label: z.string().optional(),
    url: z.string().optional()
  })).optional().default([]),
}).passthrough();

export const BlogsArraySchema = z.array(BlogSchema);

// ─── VALIDATOR ENGINE ───

export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    // Format errors nicely
    const errors = result.error.errors.map((e) => {
      const path = e.path.join(".");
      return path ? `${path}: ${e.message}` : e.message;
    });
    return { success: false, errors };
  }
}


// Global schema map to easily fetch specific section schemas later
export const SECTION_SCHEMAS: Record<string, z.ZodSchema<any>> = {
  settings: GlobalSettingsSchema,
  home: HomeSchema,
  personal: PersonalSchema,
  hero: HeroSchema,
  stats: StatsSchema,
  about: AboutSchema,
  education: EducationSchema,
  experience: ExperienceSchema,
  skills: SkillsSchema,
  techStack: TechStackSchema,
  services: ServicesSchema,
  resume: ResumeSchema,
  projects: ProjectsArraySchema,
  blog: BlogsArraySchema,
};
