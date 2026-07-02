/**
 * Shared constants and configuration.
 */

export { METRIC_DISPLAY_NAMES } from "./metric_catalog";

// Custom prompt storage keys
export const CUSTOM_PROMPT_KEY_PREFIX = "customPrompt_" as const;
export const CUSTOM_PROMPT_IDS_KEY = "customPromptIds" as const;

// Storage keys for Chrome extension (aligned between background and popup)
export const STORAGE_KEYS = {
  TRACKMAN_DATA: "trackmanData",
  SPEED_UNIT: "speedUnit",
  DISTANCE_UNIT: "distanceUnit",
  SELECTED_PROMPT_ID: "selectedPromptId",
  AI_SERVICE: "aiService",
  HITTING_SURFACE: "hittingSurface",
  INCLUDE_AVERAGES: "includeAverages",
  SESSION_HISTORY: "sessionHistory",
  IMPORT_STATUS: "importStatus",
  BULK_IMPORT_STATUS: "bulkImportStatus",
  PORTAL_ARCHIVE_EXPORT_STATUS: "portalArchiveExportStatus",
} as const;
