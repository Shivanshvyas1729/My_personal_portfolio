import React from 'react';
import { z } from 'zod';
import { Image as ImageIcon, Video } from 'lucide-react';

// ─── Enum Option Icons ────────────────────────────────────────────────────────
export const ENUM_ICONS: Record<string, string> = {
  image: '🖼️',
  video: '🎬',
  iframe: '🌐',
  pdf: '📄',
};

// ─── Media Preview ────────────────────────────────────────────────────────────
export const MediaPreview = ({ url, type }: { url: string; type?: string }) => {
  if (!url) return null;
  const isVideo = type === 'video' || /\.(mp4|webm|mov)/i.test(url) || /youtube|vimeo/i.test(url);
  return (
    <div className="mt-2 w-full h-28 rounded-lg bg-muted/30 border border-border/50 overflow-hidden relative">
      {isVideo ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground/60 gap-1">
          <Video size={28} />
          <span className="text-[10px]">Video URL set</span>
          <a href={url} target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline truncate max-w-[90%]">{url}</a>
        </div>
      ) : (
        <img
          src={getPreviewUrl(url)}
          alt="Preview"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            (e.currentTarget.nextElementSibling as HTMLElement)?.style.setProperty('display', 'flex');
          }}
        />
      )}
      {!isVideo && (
        <div className="absolute inset-0 hidden flex-col items-center justify-center bg-muted text-muted-foreground/50">
          <ImageIcon size={22} className="mb-1" />
          <span className="text-[10px]">Image failed to load</span>
        </div>
      )}
    </div>
  );
};

import { getLocalImage } from '@/lib/localImageStore';

// Convert camelCase to Title Case with custom light concepts fix
export const formatLabel = (key: string) => {
  if (key.startsWith('ropeLightColors')) return 'Fog Wash Colors ' + (key.endsWith('Dark') ? '(Dark Mode)' : '(Light Mode)');
  if (key.startsWith('ropeLightThickness')) return 'Fog Wash Thickness ' + (key.endsWith('Dark') ? '(Dark Mode)' : '(Light Mode)');
  if (key.startsWith('ropeLightGlowIntensity')) return 'Fog Wash Glow Intensity ' + (key.endsWith('Dark') ? '(Dark Mode)' : '(Light Mode)');
  if (key.startsWith('ropeLightSpeed')) return 'Fog Wash Flow Speed ' + (key.endsWith('Dark') ? '(Dark Mode)' : '(Light Mode)');
  
  if (key.startsWith('sharpLightColors')) return 'Sharp Outline Colors ' + (key.endsWith('Dark') ? '(Dark Mode)' : '(Light Mode)');
  if (key.startsWith('sharpLightThickness')) return 'Sharp Outline Thickness ' + (key.endsWith('Dark') ? '(Dark Mode)' : '(Light Mode)');
  if (key.startsWith('sharpLightSpeed')) return 'Sharp Outline Speed ' + (key.endsWith('Dark') ? '(Dark Mode)' : '(Light Mode)');

  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

const APP_BOOT_TIME = Date.now();

// Helper to safely resolve local embedded base64 images for live preview rendering
export function getPreviewUrl(url: any): string {
  if (!url) return '';
  
  if (typeof url === 'object' && url !== null) {
    if (url.secureUrl) return url.secureUrl;
    if (url.value) url = url.value; // Fallback to extract string from legacy object
  }

  if (typeof url === 'string') {
    const trimmed = url.trim();

    // Resolve old local unsaved images to base64 if they somehow survived
    if (trimmed.startsWith('https://local.image/')) {
      const b64 = getLocalImage(trimmed);
      if (b64) {
        return b64.includes('base64,') ? b64 : `data:image/webp;base64,${b64}`;
      }
    }

    // If it's a regular URL, return the GitHub raw URL with a cache buster
    const rawUrl = convertToRawGitHubUrl(url);
    if (rawUrl.includes('raw.githubusercontent.com')) {
      return `${rawUrl}?t=${APP_BOOT_TIME}`;
    }
    return rawUrl;
  }
  
  return '';
}

// Helper to convert GitHub blob URLs and relative upload paths to raw.githubusercontent.com direct image URLs
export function convertToRawGitHubUrl(url: any): string {
  if (typeof url !== 'string') return '';
  
  const trimmed = url.trim();

  // Match: https://github.com/owner/repo/blob/branch/path
  const githubBlobRegex = /^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/i;
  const match = trimmed.match(githubBlobRegex);
  if (match) {
    const [, owner, repo, branch, path] = match;
    return `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/${branch}/${path}`;
  }
  return url;
}

// ─── Fully unwrap nested Zod types ───────────────────────────────────────────
export function unwrapSchema(schema: z.ZodTypeAny, data?: any): z.ZodTypeAny {
  let s = schema;
  while (
    s instanceof z.ZodOptional ||
    s instanceof z.ZodDefault ||
    s instanceof z.ZodNullable ||
    s instanceof z.ZodUnion
  ) {
    if (s instanceof z.ZodUnion) {
      const options = s._def.options;
      if (data !== undefined && data !== null) {
        if (typeof data === 'string') {
          const stringOption = options.find((opt: any) => {
            const unwrappedOpt = unwrapSchema(opt, data);
            return unwrappedOpt instanceof z.ZodString || unwrappedOpt instanceof z.ZodEnum;
          });
          if (stringOption) {
            s = stringOption;
            continue;
          }
        } else if (Array.isArray(data)) {
          const arrayOption = options.find((opt: any) => unwrapSchema(opt, data) instanceof z.ZodArray);
          if (arrayOption) {
            s = arrayOption;
            continue;
          }
        } else if (typeof data === 'object') {
          const objectOption = options.find((opt: any) => unwrapSchema(opt, data) instanceof z.ZodObject);
          if (objectOption) {
            s = objectOption;
            continue;
          }
        }
      }
      const objectOption = options.find((opt: any) => unwrapSchema(opt, data) instanceof z.ZodObject);
      s = objectOption || options[0];
    } else {
      s = s._def.innerType;
    }
  }
  return s;
}

export const getItemPreview = (item: any): string => {
  if (!item) return "";
  if (typeof item === 'string') return item;
  if (typeof item === 'number' || typeof item === 'boolean') return String(item);
  if (typeof item === 'object') {
    const candidates = ['title', 'name', 'label', 'text', 'heading', 'role', 'school', 'company', 'url'];
    for (const cand of candidates) {
      if (item[cand] && typeof item[cand] === 'string') return item[cand];
    }
    for (const val of Object.values(item)) {
      if (typeof val === 'string' && val.trim().length > 0) return val;
    }
  }
  return "";
};

export const getSuggestionsForField = (path: string[], previewData: any, isArray: boolean): string[] => {
  const fieldName = path[path.length - 1];
  if (!fieldName) return [];

  const suggestions = new Set<string>();

  // 1. PROJECT OR BLOG CATEGORIES (COMPLETELY SEPARATED)
  if (fieldName === 'category') {
    if (isArray) {
      // PROJECT CATEGORIES ONLY (Project category is an array)
      const projects = previewData?.projects || [];
      for (const p of projects) {
        if (Array.isArray(p.category)) {
          p.category.forEach((c: any) => c && suggestions.add(String(c).trim()));
        }
      }
      if (suggestions.size === 0) {
        ['Computer Vision', 'Deep Learning', 'Machine Learning', 'Generative AI', 'NLP', 'MLOps', 'Cloud Infrastructure', 'DevOps'].forEach(s => suggestions.add(s));
      }
    } else {
      // BLOG CATEGORIES ONLY (Blog category is a simple string)
      const blogs = previewData?.blog || [];
      for (const b of blogs) {
        if (typeof b.category === 'string' && b.category) {
          suggestions.add(b.category.trim());
        }
      }
      if (suggestions.size === 0) {
        ['Thoughts', 'Notes', 'Books', 'Links', 'General'].forEach(s => suggestions.add(s));
      }
    }
  }

  // 2. TECH STACK (for 'tech' inside project, 'featured' or 'all' inside techStack, etc.)
  if (fieldName === 'tech' || fieldName === 'techStack' || fieldName === 'featured' || fieldName === 'all' || fieldName === 'items') {
    // Collect from all existing projects' tech
    const projects = previewData?.projects || [];
    for (const p of projects) {
      if (Array.isArray(p.tech)) {
        p.tech.forEach((t: any) => t && suggestions.add(String(t).trim()));
      }
    }
    // Collect from skills items in portfolio
    const skillCats = previewData?.skills?.categories || [];
    for (const cat of skillCats) {
      if (Array.isArray(cat.items)) {
        cat.items.forEach((item: any) => item && suggestions.add(String(item).trim()));
      }
    }
    // Collect from techStack settings
    const featuredTech = previewData?.techStack?.featured || [];
    featuredTech.forEach((t: any) => t && suggestions.add(String(t).trim()));
    const allTech = previewData?.techStack?.all || [];
    allTech.forEach((t: any) => t && suggestions.add(String(t).trim()));

    // Add default popular tech items if none found
    if (suggestions.size === 0) {
      ['Python', 'TypeScript', 'React', 'Next.js', 'PyTorch', 'Docker', 'AWS', 'TensorFlow', 'FastAPI', 'LangChain'].forEach(s => suggestions.add(s));
    }
  }

  // 3. BLOG TYPE
  if (fieldName === 'type') {
    // Collect from all existing blogs' type
    const blogs = previewData?.blog || [];
    for (const b of blogs) {
      if (Array.isArray(b.type)) {
        b.type.forEach((t: any) => t && suggestions.add(String(t).trim()));
      }
    }
    
    if (suggestions.size === 0) {
      ['article', 'tutorial', 'case-study', 'cloud', 'quick-note', 'guide'].forEach(s => suggestions.add(s));
    }
  }

  return Array.from(suggestions).filter(Boolean).sort();
};
