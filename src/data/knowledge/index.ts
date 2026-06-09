import { KnowledgeDefinition, KnowledgeCategory } from "./categories";

import evaluationMetrics from "./evaluation-metrics.json";
import machineLearning from "./machine-learning.json";
import deepLearning from "./deep-learning.json";
import computerVision from "./computer-vision.json";
import nlp from "./nlp.json";
import llmRag from "./llm-rag.json";
import agents from "./agents.json";
import preprocessing from "./preprocessing.json";
import featureEngineering from "./feature-engineering.json";
import validation from "./validation.json";
import explainability from "./explainability.json";
import deployment from "./deployment.json";
import mlops from "./mlops.json";
import risks from "./risks.json";
import ethics from "./ethics.json";
import privacy from "./privacy.json";
import softwareEngineering from "./software-engineering.json";
import cloud from "./cloud.json";
import databases from "./databases.json";
import vectorDatabases from "./vector-databases.json";

// Aggregate all definitions
export const allDefinitions: Partial<KnowledgeDefinition>[] = [
  ...evaluationMetrics,
  ...machineLearning,
  ...deepLearning,
  ...computerVision,
  ...nlp,
  ...llmRag,
  ...agents,
  ...preprocessing,
  ...featureEngineering,
  ...validation,
  ...explainability,
  ...deployment,
  ...mlops,
  ...risks,
  ...ethics,
  ...privacy,
  ...softwareEngineering,
  ...cloud,
  ...databases,
  ...vectorDatabases,
] as unknown as Partial<KnowledgeDefinition>[];

export const globalKnowledgeMap = new Map<string, KnowledgeDefinition>();
export const aliasLookupMap = new Map<string, string>();

allDefinitions.forEach(def => {
  if (def.id) {
    globalKnowledgeMap.set(def.id, def as KnowledgeDefinition);
    
    // Add primary ID to alias map
    aliasLookupMap.set(def.id.toLowerCase(), def.id);
    
    // Add title to alias map
    if (def.title) {
      aliasLookupMap.set(def.title.toLowerCase(), def.id);
    }

    // Add all explicit aliases
    if (def.aliases) {
      def.aliases.forEach(alias => {
        aliasLookupMap.set(alias.toLowerCase(), def.id as string);
      });
    }
  }
});

export const getKnowledge = (term: string): KnowledgeDefinition | undefined => {
  if (!term) return undefined;
  const normalized = term.trim().toLowerCase();
  
  // 1. Exact alias or ID match (O(1))
  const directId = aliasLookupMap.get(normalized);
  if (directId) {
    return globalKnowledgeMap.get(directId);
  }

  // 1.5 Clean match (ignore hyphens, underscores, spaces)
  const cleanTerm = normalized.replace(/[-_\s]/g, '');
  if (cleanTerm) {
    for (const [alias, id] of aliasLookupMap.entries()) {
      if (alias.replace(/[-_\s]/g, '') === cleanTerm) {
        return globalKnowledgeMap.get(id);
      }
    }
  }

  // 2. Fallback fuzzy search (e.g. if string has extra words like "Accuracy (Validation)")
  for (const [alias, id] of aliasLookupMap.entries()) {
    // Only trigger if alias is significant length to avoid false positives
    if (alias.length > 3 && (normalized.includes(alias) || alias.includes(normalized))) {
      return globalKnowledgeMap.get(id);
    }
  }

  return undefined;
};

export const searchKnowledge = (
  query: string, 
  limit: number = 5,
  allowedCategories?: KnowledgeCategory[]
): KnowledgeDefinition[] => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  // Filter definitions based on allowedCategories if provided
  const candidates = allowedCategories && allowedCategories.length > 0
    ? allDefinitions.filter(def => def.primary_category && allowedCategories.includes(def.primary_category as KnowledgeCategory))
    : allDefinitions;

  const results: { def: KnowledgeDefinition; score: number }[] = [];

  candidates.forEach((def) => {
    let score = 0;

    // Exact Title/ID match
    if (def.title?.toLowerCase() === normalized || def.id?.toLowerCase() === normalized) {
      score += 100;
    }
    // Partial Title match
    else if (def.title?.toLowerCase().includes(normalized)) {
      score += 50;
    }

    // Alias match
    if (def.aliases?.some(a => a.toLowerCase() === normalized)) {
      score += 80;
    } else if (def.aliases?.some(a => a.toLowerCase().includes(normalized))) {
      score += 40;
    }

    // Tag match
    if (def.secondary_tags?.some(t => t.toLowerCase() === normalized)) {
      score += 15;
    } else if (def.secondary_tags?.some(t => t.toLowerCase().includes(normalized))) {
      score += 5;
    }

    if (def.primary_category?.toLowerCase().includes(normalized)) {
      score += 5;
    }

    // Keyword in definition match
    if (def.definition?.toLowerCase().includes(normalized)) {
      score += 10;
    }

    if (score > 0) {
      results.push({ def: def as KnowledgeDefinition, score });
    }
  });

  return results.sort((a, b) => b.score - a.score).slice(0, limit).map(r => r.def);
};

export const getAllKnowledge = (): KnowledgeDefinition[] => {
  return Array.from(globalKnowledgeMap.values());
};

export const getKnowledgeWithOverrides = (term: string, projectContext?: { knowledge_overrides?: Partial<KnowledgeDefinition>[] }): Partial<KnowledgeDefinition> | undefined => {
  const globalDef = getKnowledge(term);
  if (!globalDef) return undefined;

  const overrides = projectContext?.knowledge_overrides || [];
  const overrideDef = overrides.find(o => o.id === globalDef.id);

  if (overrideDef) {
    return { ...globalDef, ...overrideDef };
  }

  return globalDef;
};
