import React, { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { KNOWLEDGE_CATEGORIES, KnowledgeCategory, KnowledgeDefinition } from '@/data/knowledge/categories';

interface HealthIssue {
  id: string;
  term: string;
  type: 'invalid_category' | 'duplicate' | 'empty' | 'missing_fields' | 'wrong_category';
  message: string;
  suggestedFix?: string;
  domainFile: string;
}

const COMMON_TERM_MAPPINGS: Record<string, KnowledgeCategory> = {
  'xgboost': 'Machine Learning',
  'lightgbm': 'Machine Learning',
  'random forest': 'Machine Learning',
  'accuracy': 'Evaluation Metrics',
  'precision': 'Evaluation Metrics',
  'recall': 'Evaluation Metrics',
  'f1 score': 'Evaluation Metrics',
  'shap': 'Explainability',
  'lime': 'Explainability',
  'docker': 'Deployment',
  'kubernetes': 'Deployment',
  'fastapi': 'Deployment',
  'smote': 'Preprocessing',
  'pca': 'Feature Engineering',
  'yolo': 'Computer Vision',
  'bert': 'Natural Language Processing',
  'gpt': 'Generative AI',
  'langchain': 'RAG',
  'crewai': 'Agents'
};

export const KnowledgeHealthCheck = ({ domains }: { domains: { id: string, title: string, file: string }[] }) => {
  const [issues, setIssues] = useState<HealthIssue[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runCheck = async () => {
    setIsRunning(true);
    const newIssues: HealthIssue[] = [];
    const seenTerms = new Set<string>();

    for (const domain of domains) {
      try {
        const res = await fetch(`/api/cms-knowledge?filePath=${encodeURIComponent(domain.file)}`);
        if (!res.ok) continue;
        
        const data: KnowledgeDefinition[] = await res.json();
        
        if (!data || data.length === 0) {
          newIssues.push({
            id: domain.id,
            term: domain.title,
            type: 'empty',
            message: `${domain.title} category is empty.`,
            domainFile: domain.file
          });
          continue;
        }

        data.forEach(def => {
          // Check Duplicates
          const termLower = def.title.toLowerCase();
          if (seenTerms.has(termLower)) {
            newIssues.push({
              id: def.id,
              term: def.title,
              type: 'duplicate',
              message: `Duplicate term found: ${def.title}`,
              domainFile: domain.file
            });
          }
          seenTerms.add(termLower);

          // Check Invalid Categories
          if (!KNOWLEDGE_CATEGORIES.includes(def.primary_category as KnowledgeCategory)) {
            newIssues.push({
              id: def.id,
              term: def.title,
              type: 'invalid_category',
              message: `Invalid primary_category: ${def.primary_category}`,
              domainFile: domain.file
            });
          }

          // Check Misplaced Categories (Heuristic based on User Prompt)
          const expectedCategory = COMMON_TERM_MAPPINGS[termLower];
          if (expectedCategory && def.primary_category !== expectedCategory) {
            newIssues.push({
              id: def.id,
              term: def.title,
              type: 'wrong_category',
              message: `⚠ ${def.title} found in ${def.primary_category}.`,
              suggestedFix: expectedCategory,
              domainFile: domain.file
            });
          }
        });
      } catch (e) {
        console.error(`Failed to load ${domain.file}`, e);
      }
    }

    setIssues(newIssues);
    setLastRun(new Date());
    setIsRunning(false);
  };

  return (
    <div className="bg-background border border-border/40 rounded-xl p-5 mt-6 mb-6 overflow-hidden relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold flex items-center gap-2">
            <Activity size={18} className="text-primary" /> Category Health Check
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Run automated validation to detect taxonomy issues, duplicate terms, and empty domains.
          </p>
        </div>
        <button
          onClick={runCheck}
          disabled={isRunning}
          className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg border border-primary/20 flex items-center gap-2 transition-all"
        >
          <RefreshCw size={14} className={isRunning ? "animate-spin" : ""} />
          {isRunning ? "Scanning Matrix..." : "Run Health Check"}
        </button>
      </div>

      {lastRun && (
        <div className="mt-4 pt-4 border-t border-border/30">
          {issues.length === 0 ? (
            <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 text-sm font-medium">
              <CheckCircle2 size={16} /> Perfect! Matrix taxonomy is perfectly healthy.
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              {issues.map((issue, idx) => (
                <div key={`${issue.id}-${idx}`} className="bg-muted/30 border border-border/40 rounded-lg p-3 flex gap-3 items-start">
                  <AlertTriangle size={16} className={issue.type === 'wrong_category' ? 'text-amber-500 shrink-0 mt-0.5' : 'text-destructive shrink-0 mt-0.5'} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{issue.message}</p>
                    {issue.suggestedFix && (
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">Suggested Category: <span className="font-bold text-primary">{issue.suggestedFix}</span></span>
                        <button className="text-[10px] bg-primary text-primary-foreground px-2 py-1 rounded font-bold hover:bg-primary/90 transition-colors">
                          One-click Fix
                        </button>
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-2 font-mono">{issue.domainFile}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
