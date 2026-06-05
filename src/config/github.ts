import { resolveConfig } from "./env.js";

export const githubConfig = {
  get owner(): string {
    return resolveConfig().owner;
  },

  get repo(): string {
    return resolveConfig().repo;
  },

  get branch(): string {
    return resolveConfig().branch;
  },

  get token(): string | undefined {
    return resolveConfig().token;
  },

  /**
   * Constructs the Raw GitHub base URL dynamically for any file
   */
  getRawBaseUrl(subpath: string = "src/data"): string {
    const config = resolveConfig();
    return `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${subpath}`;
  },

  /**
   * Helper to verify if custom credentials are in use
   */
  isForked(): boolean {
    const config = resolveConfig();
    return config.owner !== "Shivanshvyas1729" || config.repo !== "My_personal_portfolio";
  }
};
