export const KNOWLEDGE_CATEGORIES = [
  "Machine Learning",
  "Deep Learning",
  "Computer Vision",
  "Natural Language Processing",
  "Generative AI",
  "RAG",
  "Agents",
  "Feature Engineering",
  "Preprocessing",
  "Evaluation Metrics",
  "Validation",
  "Explainability",
  "Deployment",
  "MLOps",
  "Software Engineering",
  "Risks",
  "Ethics",
  "Privacy",
  "Cloud",
  "DevOps",
  "Databases",
  "Vector Databases"
] as const;

export type KnowledgeCategory = typeof KNOWLEDGE_CATEGORIES[number];

export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";
export type TermType = "Algorithm" | "Metric" | "Technique" | "Concept" | "Tool" | "Framework";

export interface KnowledgeDefinition {
  id: string;
  title: string;
  primary_category: KnowledgeCategory;
  aliases?: string[];
  secondary_tags?: string[];
  definition: string;
  why_used?: string;
  interview_point?: string;
  advantages?: string[];
  limitations?: string[];
  formula?: string;
  good_value?: string;
  use_cases?: string[];
  related_terms?: string[];
  real_world_example?: string;
  difficulty_level?: DifficultyLevel;
  term_type?: TermType;
}
