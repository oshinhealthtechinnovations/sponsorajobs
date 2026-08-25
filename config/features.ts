/**
 * Feature Flags Configuration
 * As required by Master Build Prompt Section 136
 */

export interface FeatureFlags {
  enableAdzuna: boolean;
  enableUSAJobs: boolean;
  enableATS: boolean;
  enableSavedJobs: boolean;
  enableEmployerPosting: boolean;
}

export function getFeatureFlags(env?: Record<string, string | undefined>): FeatureFlags {
  const getVal = (key: string, defaultVal: boolean = false): boolean => {
    const v = env?.[key] ?? (typeof process !== "undefined" ? process.env[key] : undefined);
    if (v === undefined || v === "") return defaultVal;
    return v === "true" || v === "1";
  };

  return {
    enableAdzuna: getVal("ENABLE_ADZUNA", false),
    enableUSAJobs: getVal("ENABLE_USAJOBS", false),
    enableATS: getVal("ENABLE_ATS", false),
    enableSavedJobs: getVal("ENABLE_SAVED_JOBS", false),
    enableEmployerPosting: getVal("ENABLE_EMPLOYER_POSTING", false),
  };
}
