/// <reference path="../vite-env.d.ts" />
import rawData from "./portfolio.yaml?raw";
import rawProjects from "./projects.yaml?raw";
import rawBlog from "./blog.yaml?raw";
import YAML from "yaml";
import { githubConfig } from "../config/index.js";

export interface CloudinaryMedia {
  secureUrl: string;
  publicId: string;
  resourceType: "image" | "video" | "raw";
}

export type ProfileImage = CloudinaryMedia | {
  type: "local" | "url";
  value: string;
  position: "left" | "right" | "center";
  objectPosition?: string;
} | string;

export interface CTA {
  label: string;
  link: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  description?: string;
}

export interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface SkillCategory {
  title: string;
  items: string[];
}

export interface Service {
  title: string;
  description: string;
  icon?: string;
}

export interface ProjectMedia {
  secureUrl?: string;
  publicId?: string;
  resourceType?: "image" | "video" | "raw";
  type?: "image" | "video";
  url?: string;
  caption?: string;
}

export interface Project {
  id: number;
  title: string;
  category: string[];
  description: string;
  tech: string[];
  github: string;
  live: string;
  featured: boolean;
  impact: string;
  domain?: string;
  architectureImage?: string;
  media?: ProjectMedia[];
  howItWorks?: string;
  resources?: { label: string; url: string }[];
  problem_statement?: string;
  business_problem?: string;
  learning_outcomes?: string[];
  architecture?: string;
  objectives?: string[];
  success_criteria?: string[];
  data_sources?: string[];
  data_volume?: string;
  class_distribution?: string | string[] | Record<string, string | number>;
  target_variable?: string;
  features?: string[];
  model_inputs?: string[];
  model_outputs?: string[];
  preprocessing?: string[];
  feature_engineering?: string[];
  modeling?: string[];
  hyperparameters?: string[];
  evaluation_metrics?: string[];
  validation_strategy?: string;
  explainability?: string;
  training_environment?: string | string[];
  deployment?: string;
  inference_pipeline?: string | string[];
  monitoring?: string | string[];
  versioning?: string | string[];
  risks?: string[];
  ethics?: string[];
  privacy?: string[];
  known_limitations?: string[];
  future_improvements?: string[];
  open_resources?: { label: string; url: string }[];
  metrics?: Record<string, string | number>;
  knowledge_overrides?: Array<{
    id: string;
    [key: string]: any;
  }>;
}

export interface Settings {
  [key: string]: unknown;
  ropeLightColors?: string[];
  ropeLightSpeed?: number;
  ropeLightThickness?: number;
  ropeLightGlowIntensity?: number;
  sharpLightSpeed?: number;

  // Independent dark and light mode wash settings
  ropeLightColorsLight?: string[];
  ropeLightColorsDark?: string[];
  ropeLightSpeedLight?: number;
  ropeLightSpeedDark?: number;
  ropeLightThicknessLight?: number;
  ropeLightThicknessDark?: number;
  ropeLightGlowIntensityLight?: number;
  ropeLightGlowIntensityDark?: number;

  ropeLightColorLight?: string;
  ropeLightColorDark?: string;
  ropeLightAccentLight?: string;
  ropeLightAccentDark?: string;

  // Sharp line edge light controls for dark and light mode
  sharpLightColorsLight?: string[];
  sharpLightColorsDark?: string[];
  sharpLightThicknessLight?: number;
  sharpLightThicknessDark?: number;
  sharpLightThickness?: number;
  sharpLightColors?: string[];
  sharpLightSpeedLight?: number;
  sharpLightSpeedDark?: number;

  textHoverColors?: string[];
  textTransitionSpeed?: string;
  textLeaveSpeed?: string;
  textAnimationSpeed?: string;
  textBaseOpacity?: number;
  textGlowIntensity?: number;
  themePrimaryColor?: string;
  themeBackgroundColor?: string;
  themeAccentColor?: string;
  themeFontFamily?: string;
  customCursorEnabled?: boolean;
  edgeLightsEnabled?: boolean;

  // Intro / Transition Settings
  introEnabled?: boolean;
  introStyle?: 'namaste' | 'pulse' | 'academic' | 'terminal' | 'minimal' | 'creative';
  introPrimaryText?: string;
  introSubtitle?: string;
  introTagline?: string;
  introColors?: string[];
  introDuration?: number;
}

export interface PortfolioData {
  home?: {
    featuredProjectsCount?: number;
    featuredProjectIds?: number[];
  };
  settings?: Settings;
  personal: {
    name: string;
    title: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    location: string;
    profileImage: ProfileImage;
  };
  hero: {
    headline: string[];
    description: string;
    ctas: CTA[];
  };
  stats: {
    projectsCount: number;
    experienceCount: number;
  };
  about: {
    description: string;
    marqueeTexts: string[];
    certifications: string[];
  };
  education: Education[];
  experience: Experience[];
  skills: {
    categories: SkillCategory[];
  };
  techStack: {
    featured: string[];
    all: string[];
    connections?: string[][];
  };
  services: Service[];
  projects: Project[];
  blog: any[];
  resume?: {
    url?: string;
    categories?: {
      name: string;
      url: string;
      visible: boolean;
    }[];
  };
}

let parsedData: Partial<PortfolioData> = {};
let parsedProjects: { projects: Project[] } = { projects: [] };
let parsedBlog: { blog: any[] } = { blog: [] };

try {
  parsedData = YAML.parse(rawData);
} catch (error) {
  console.error("Failed to parse portfolio.yaml. Ensure the YAML syntax is correct. Using safe fallback.", error);
  parsedData = { skills: { categories: [] }, techStack: { featured: [], all: [] } } as any;
}

try {
  parsedProjects = YAML.parse(rawProjects);
} catch (error) {
  console.error("Failed to parse projects.yaml. Ensure the YAML syntax is correct. Using safe fallback.", error);
  parsedProjects = { projects: [] };
}
try {
  parsedBlog = YAML.parse(rawBlog);
} catch (error) {
  console.error("Failed to parse blog.yaml. Ensure the YAML syntax is correct. Using safe fallback.", error);
  parsedBlog = { blog: [] };
}

// Fixed logic for sorting projects
const projects = (parsedProjects?.projects || []).slice();
projects.sort((a, b) => (b.id || 0) - (a.id || 0));

export const LIGHT_DEFAULTS = {
  ropeLightColors: ["#eab30866", "#67e8f966", "#6366f166", "#a855f766"],
  ropeLightSpeed: 12.0,
  ropeLightThickness: 1.5,
  ropeLightGlowIntensity: 3.0,
  ropeLightColorsLight: ["#fde68a44", "#93c5fd44", "#67e8f944"],
  ropeLightColorsDark: ["#eab30866", "#67e8f966", "#6366f166", "#a855f766"],
  ropeLightSpeedLight: 12.0,
  ropeLightSpeedDark: 12.0,
  ropeLightThicknessLight: 1.5,
  ropeLightThicknessDark: 1.5,
  ropeLightGlowIntensityLight: 3.0,
  ropeLightGlowIntensityDark: 3.0,
  ropeLightColorLight: "#fde68a44",
  ropeLightColorDark: "#a1620744",
  sharpLightColorsDark: ["#facc1544", "#93c5fd44", "#67e8f944"],
  sharpLightThicknessDark: 1.5,
  sharpLightColorsLight: ["#facc1533", "#93c5fd33"],
  sharpLightThicknessLight: 1.5,
  sharpLightSpeed: 12.0,
  sharpLightSpeedDark: 12.0,
  sharpLightSpeedLight: 12.0,
};

export const portfolioData: PortfolioData = {
  ...parsedData,
  settings: {
    ...LIGHT_DEFAULTS,
    ...(parsedData?.settings || {})
  },
  projects,
  blog: (parsedBlog?.blog || []).sort((a, b) => (b.id || 0) - (a.id || 0))
} as PortfolioData;

/**
 * PRODUCTION LIVE SYNC: 
 * Fetches the absolute latest YAML from GitHub Raw at runtime.
 * This allows "Instant" updates on the live site without waiting for a 3-minute Vercel build.
 */
export async function getLivePortfolioData(): Promise<PortfolioData> {
  if (typeof window === 'undefined') return portfolioData; // SSR fallback

  try {
    const RAW_BASE = githubConfig.getRawBaseUrl();
    const [pRes, sRes, bRes] = await Promise.all([
      fetch(`${RAW_BASE}/portfolio.yaml?t=${Date.now()}`),
      fetch(`${RAW_BASE}/projects.yaml?t=${Date.now()}`),
      fetch(`${RAW_BASE}/blog.yaml?t=${Date.now()}`)
    ]);

    if (!pRes.ok || !sRes.ok || !bRes.ok) throw new Error("GitHub fetch failed");

    const pYaml = await pRes.text();
    const sYaml = await sRes.text();
    const bYaml = await bRes.text();

    const pData = YAML.parse(pYaml);
    const sData = YAML.parse(sYaml);
    const bData = YAML.parse(bYaml);

    return {
      ...pData,
      settings: {
        ...LIGHT_DEFAULTS,
        ...(pData?.settings || {})
      },
      projects: (sData?.projects || []).sort((a: any, b: any) => (b.id || 0) - (a.id || 0)),
      blog: (bData?.blog || []).sort((a: any, b: any) => (b.id || 0) - (a.id || 0))
    } as PortfolioData;
  } catch (e) {
    console.warn("CMS: Live refresh failed, using build-time bundle.", e);
    return portfolioData;
  }
}

export const getFeaturedProjects = (data: PortfolioData): Project[] => {
  const config = data.home;
  const allProjects = data.projects || [];

  if (config?.featuredProjectIds && config.featuredProjectIds.length > 0) {
    return Array.from(new Set(config.featuredProjectIds))
      .map((id) => allProjects.find((p) => p.id === id))
      .filter((p): p is Project => p !== undefined);
  }

  const limit = (config?.featuredProjectsCount !== undefined && config.featuredProjectsCount >= 0)
    ? config.featuredProjectsCount
    : 3;

  return allProjects.filter((p) => p.featured).slice(0, limit);
};

export const getCategories = (projects: Project[]) => {
  const allCats = projects.flatMap((p) => (p.category || []).map(c => c.trim()).filter(Boolean));
  return ["All", ...Array.from(new Set(allCats))];
};

export const hasContent = (section: unknown[] | string | undefined | null) => {
  if (Array.isArray(section)) return section.length > 0;
  if (typeof section === "string") return section.trim().length > 0;
  return !!section;
};
