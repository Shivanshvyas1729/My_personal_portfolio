// Helper to get raw environment variables in a cross-platform manner
export function getRawEnvVar(key: string): string | undefined {
  // In the browser, Vite compile-time env variables are loaded from import.meta.env
  // @ts-ignore
  if (typeof import.meta !== "undefined" && import.meta.env) {
    // @ts-ignore
    return (import.meta.env[key] || import.meta.env[`VITE_${key}`])?.trim();
  }
  return undefined;
}

// Struct for final config
export interface Config {
  owner: string;
  repo: string;
  branch: string;
  token: string | undefined;
  adminPassword: string | undefined;
  adminUsername: string | undefined;
  emailjsServiceId: string | undefined;
  emailjsTemplateId: string | undefined;
  emailApiKey: string | undefined;
  cloudinaryCloudName: string | undefined;
  cloudinaryUploadPreset: string | undefined;
  isProduction: boolean;
  isLocalMode: boolean;
}

/**
 * Centered configuration service for frontend.
 * Pure and browser-safe, loads from build-time compile variables.
 * Excludes all Node-only modules (fs, path, child_process) to prevent browser bundling crashes.
 */
export function resolveConfig(): Config {
  const isProduction = getRawEnvVar("NODE_ENV") === "production" || !!getRawEnvVar("VERCEL") || !!getRawEnvVar("NETLIFY");
  
  // These values are injected by Vite at compile-time via define
  const owner = getRawEnvVar("GITHUB_OWNER") || getRawEnvVar("CMS_REPO_OWNER") || "Shivanshvyas1729";
  const repo = getRawEnvVar("GITHUB_REPO") || getRawEnvVar("CMS_REPO_NAME") || "My_personal_portfolio";
  const branch = getRawEnvVar("GITHUB_BRANCH") || "main";
  
  const token = getRawEnvVar("GITHUB_TOKEN");
  const adminPassword = getRawEnvVar("ADMIN_PASSWORD");
  const adminUsername = getRawEnvVar("ADMIN_USERNAME");
  
  const emailjsServiceId = getRawEnvVar("EMAILJS_SERVICE_ID");
  const emailjsTemplateId = getRawEnvVar("EMAILJS_TEMPLATE_ID");
  const emailApiKey = getRawEnvVar("EMAIL_API_KEY");

  const cloudinaryCloudName = getRawEnvVar("CLOUDINARY_CLOUD_NAME");
  const cloudinaryUploadPreset = getRawEnvVar("CLOUDINARY_UPLOAD_PRESET");

  const isLocalMode = !isProduction && (getRawEnvVar("CMS_MODE") === "local" || !getRawEnvVar("GITHUB_TOKEN"));

  return {
    owner,
    repo,
    branch,
    token,
    adminPassword,
    adminUsername,
    emailjsServiceId,
    emailjsTemplateId,
    emailApiKey,
    cloudinaryCloudName,
    cloudinaryUploadPreset,
    isProduction,
    isLocalMode,
  };
}

/**
 * Validates the required configuration variables.
 * Fails early if vital parameters are missing in production.
 */
export function validateEnv(): { valid: boolean; errors: string[] } {
  const config = resolveConfig();
  const errors: string[] = [];

  if (!config.owner) errors.push("Missing GITHUB_OWNER");
  if (!config.repo) errors.push("Missing GITHUB_REPO");
  if (!config.adminPassword) {
    errors.push("Missing ADMIN_PASSWORD in environment (required for secure authentication)");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Startup hook to fail-early and print readable errors
 */
export function verifyStartup() {
  const { valid, errors } = validateEnv();
  if (!valid) {
    const errorHeading = `\n❌ Missing or invalid required environment variables:\n`;
    const errorDetails = errors.map(err => `  - ${err}`).join("\n");
    const errorRecovery = `\n\nPlease configure these values in your '.env' file.\n`;
    
    console.error(errorHeading + errorDetails + errorRecovery);
  }
}
