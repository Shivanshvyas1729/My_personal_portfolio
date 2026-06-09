import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { Project } from "@/data/portfolioData";

export const useProjectFilter = (projects: Project[]) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("category");
  const urlDomain = searchParams.get("domain");

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDomain, setSelectedDomain] = useState<string>("All");

  // Sync state with URL params on mount / URL change
  useEffect(() => {
    setSelectedCategory(urlCategory || "All");
    setSelectedDomain(urlDomain || "All");
  }, [urlCategory, urlDomain]);

  const handleSetCategory = (category: string) => {
    setSelectedCategory(category);
    setSelectedDomain("All"); // reset domain when category changes
    const next = new URLSearchParams(searchParams);
    if (category === "All") {
      next.delete("category");
    } else {
      next.set("category", category);
    }
    next.delete("domain");
    setSearchParams(next);
  };

  const handleSetDomain = (domain: string) => {
    setSelectedDomain(domain);
    setSelectedCategory("All"); // reset category when domain changes
    const next = new URLSearchParams(searchParams);
    if (domain === "All") {
      next.delete("domain");
    } else {
      next.set("domain", domain);
    }
    next.delete("category");
    setSearchParams(next);
  };

  // ── Unique categories (from p.category[]) ────────────────────────────────
  const categories = useMemo(() => {
    const raw = projects.flatMap(p =>
      Array.isArray(p.category) ? p.category : []
    );

    const valid = raw
      .filter(c => typeof c === "string" && c.trim().length > 0)
      .map(c => c.trim());

    const uniqueMap = new Map<string, string>();
    valid.forEach(c => {
      const key = c.toLowerCase();
      if (!uniqueMap.has(key)) uniqueMap.set(key, c);
    });

    const unique = Array.from(uniqueMap.values());

    const priority = ["Generative AI", "Machine Learning"];
    unique.sort((a, b) => {
      const ia = priority.findIndex(p => p.toLowerCase() === a.toLowerCase());
      const ib = priority.findIndex(p => p.toLowerCase() === b.toLowerCase());
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });

    return ["All", ...unique];
  }, [projects]);

  // ── Unique domains (from optional p.domain) ───────────────────────────────
  // Only projects that have a non-empty domain string contribute here.
  const domains = useMemo(() => {
    const raw = projects
      .map(p => p.domain)
      .filter((d): d is string => typeof d === "string" && d.trim().length > 0)
      .map(d => d.trim());

    const uniqueMap = new Map<string, string>();
    raw.forEach(d => {
      const key = d.toLowerCase();
      if (!uniqueMap.has(key)) uniqueMap.set(key, d);
    });

    const unique = Array.from(uniqueMap.values()).sort((a, b) =>
      a.localeCompare(b)
    );

    // Return empty list if no project has a domain — UI can hide the section
    return unique.length > 0 ? ["All", ...unique] : [];
  }, [projects]);

  // ── Category counts ───────────────────────────────────────────────────────
  const counts = useMemo(() => {
    const map: Record<string, number> = { All: projects.length };
    categories.forEach(c => { if (c !== "All") map[c] = 0; });

    projects.forEach(p => {
      if (!Array.isArray(p.category)) return;
      const normalized = p.category.map(c => c.trim().toLowerCase());
      categories.forEach(c => {
        if (c !== "All" && normalized.includes(c.toLowerCase())) map[c]++;
      });
    });

    return map;
  }, [categories, projects]);

  // ── Domain counts (only for projects that have domain set) ────────────────
  const domainCounts = useMemo(() => {
    const map: Record<string, number> = { All: projects.length };
    domains.forEach(d => { if (d !== "All") map[d] = 0; });

    projects.forEach(p => {
      if (!p.domain || typeof p.domain !== "string") return;
      const normalized = p.domain.trim().toLowerCase();
      domains.forEach(d => {
        if (d !== "All" && d.toLowerCase() === normalized) map[d]++;
      });
    });

    return map;
  }, [domains, projects]);

  // ── Filtered projects (category XOR domain) ───────────────────────────────
  const filteredProjects = useMemo(() => {
    let result = projects;

    if (selectedCategory.toLowerCase() !== "all") {
      const target = selectedCategory.trim().toLowerCase();
      result = result.filter(
        p =>
          Array.isArray(p.category) &&
          p.category.some(c => c.trim().toLowerCase() === target)
      );
    }

    if (selectedDomain.toLowerCase() !== "all") {
      const target = selectedDomain.trim().toLowerCase();
      result = result.filter(
        p =>
          typeof p.domain === "string" &&
          p.domain.trim().toLowerCase() === target
      );
    }

    return result;
  }, [projects, selectedCategory, selectedDomain]);

  return {
    categories,
    domains,           // empty [] if no project has a domain — UI hides section
    selectedCategory,
    selectedDomain,
    setSelectedCategory: handleSetCategory,
    setSelectedDomain: handleSetDomain,
    filteredProjects,
    counts,
    domainCounts,
  };
};
