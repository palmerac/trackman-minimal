/**
 * Shared constants and configuration.
 */

export { METRIC_DISPLAY_NAMES } from "./metric_catalog";

// Storage keys for Chrome extension (aligned between background and popup)
export const STORAGE_KEYS = {
  TRACKMAN_DATA: "trackmanData",
  SPEED_UNIT: "speedUnit",
  DISTANCE_UNIT: "distanceUnit",
  HITTING_SURFACE: "hittingSurface",
  INCLUDE_AVERAGES: "includeAverages",
  SESSION_HISTORY: "sessionHistory",
  IMPORT_STATUS: "importStatus",
  BULK_IMPORT_STATUS: "bulkImportStatus",
  PORTAL_ARCHIVE_EXPORT_STATUS: "portalArchiveExportStatus",
} as const;
