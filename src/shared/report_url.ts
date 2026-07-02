import type { SessionData } from "../models/types";
import { REPORT_PAGE_ORIGIN } from "./runtime_messages";

export function classifyReportUrlType(sourceUrl: string | URL): SessionData["url_type"] {
  const parsedUrl = typeof sourceUrl === "string"
    ? new URL(sourceUrl, REPORT_PAGE_ORIGIN)
    : sourceUrl;
  return parsedUrl.searchParams.has("a") ? "activity" : "report";
}
