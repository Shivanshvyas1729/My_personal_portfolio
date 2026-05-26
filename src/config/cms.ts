import { resolveConfig } from "./env";

export const cmsConfig = {
  get adminPassword(): string | undefined {
    return resolveConfig().adminPassword;
  },

  get adminUsername(): string | undefined {
    return resolveConfig().adminUsername;
  },

  get isLocalMode(): boolean {
    return resolveConfig().isLocalMode;
  },

  emailjs: {
    get serviceId(): string | undefined {
      return resolveConfig().emailjsServiceId;
    },
    get templateId(): string | undefined {
      return resolveConfig().emailjsTemplateId;
    },
    get apiKey(): string | undefined {
      return resolveConfig().emailApiKey;
    },
    get hasConfig(): boolean {
      const config = resolveConfig();
      return !!(config.emailjsServiceId && config.emailjsTemplateId && config.emailApiKey);
    }
  },

  cloudinary: {
    get cloudName(): string | undefined {
      return resolveConfig().cloudinaryCloudName;
    },
    get uploadPreset(): string | undefined {
      return resolveConfig().cloudinaryUploadPreset;
    },
    get hasConfig(): boolean {
      const config = resolveConfig();
      return !!(config.cloudinaryCloudName && config.cloudinaryUploadPreset);
    }
  }
};
