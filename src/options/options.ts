/**
 * Options page UI logic for TrackPull Extension.
 * Handles CRUD operations for custom prompts and AI service preference.
 */

import { BUILTIN_PROMPTS } from "../shared/prompt_types";
import type { CustomPrompt } from "../shared/prompt_types";
import {
  CUSTOM_PROMPT_DATA_PLACEHOLDER_ERROR,
  deleteCustomPrompt,
  loadCustomPrompts,
  saveCustomPrompt,
  validateCustomPromptTemplate,
} from "../shared/custom_prompts";
import { clearAllBulkImportedSessions } from "../shared/bulk_import_store";
import { CUSTOM_PROMPT_KEY_PREFIX, CUSTOM_PROMPT_IDS_KEY, STORAGE_KEYS } from "../shared/constants";
import type { ActivitySummary, FetchActivitiesQueryCandidate } from "../shared/import_types";
import {
  FETCH_ACTIVITIES_MAX_PAGES,
  FETCH_ACTIVITIES_PAGE_SIZE,
  FETCH_ACTIVITIES_QUERY_CANDIDATES,
  IMPORT_SESSION_QUERY_CANDIDATES,
  isSupportedPortalActivityType,
} from "../shared/import_types";
import type { ArchiveExportFailure, ArchiveExportItem, ArchiveExportJob } from "../shared/archive_export";
import { buildArchiveExportOutputs } from "../shared/archive_builder";
import {
  clearAllArchiveExports,
  clearArchiveExportJob,
  getArchiveExportFailures,
  getArchiveExportSessions,
  putArchiveExportItem,
  putArchiveExportJob,
} from "../shared/archive_export_store";
import { RUNTIME_MESSAGE_TYPES } from "../shared/runtime_messages";
import { hasPortalPermission, requestPortalPermission } from "../shared/portalPermissions";
import { DEFAULT_UNIT_CHOICE, type UnitChoice } from "../shared/unit_normalization";

/** Tracks which custom prompt is being edited (null = creating new) */
let editingPromptId: string | null = null;

document.addEventListener("DOMContentLoaded", async () => {
  renderBuiltInPrompts();
  await renderCustomPrompts();
  setupNewPromptForm();
  setupPrivacyActions();
  await restoreAiPreference();
  await setupPortalArchiveExport();
});

/** Renders all built-in prompts as read-only items. */
function renderBuiltInPrompts(): void {
  const container = document.getElementById("builtin-prompts-list");
  if (!container) return;

  container.innerHTML = "";

  for (const prompt of BUILTIN_PROMPTS) {
    const item = document.createElement("div");
    item.className = "builtin-prompt-item";

    const nameSpan = document.createElement("span");
    nameSpan.className = "prompt-name";
    nameSpan.textContent = prompt.name;

    const tierBadge = document.createElement("span");
    tierBadge.className = `tier-badge ${prompt.tier}`;
    tierBadge.textContent = prompt.tier.charAt(0).toUpperCase() + prompt.tier.slice(1);

    item.appendChild(nameSpan);
    item.appendChild(tierBadge);
    container.appendChild(item);
  }
}

/** Renders all custom prompts with edit and delete buttons. */
async function renderCustomPrompts(): Promise<void> {
  const container = document.getElementById("custom-prompts-list");
  if (!container) return;

  container.innerHTML = "";

  const prompts = await loadCustomPrompts();

  if (prompts.length === 0) {
    const empty = document.createElement("p");
    empty.className = "no-custom-prompts";
    empty.textContent = "No custom prompts yet.";
    container.appendChild(empty);
    return;
  }

  for (const prompt of prompts) {
    const item = document.createElement("div");
    item.className = "custom-prompt-item";

    const nameSpan = document.createElement("span");
    nameSpan.className = "custom-prompt-name";
    nameSpan.textContent = prompt.name;

    const actions = document.createElement("div");
    actions.className = "custom-prompt-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn-action";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openEditForm(prompt));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-action delete";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", async () => {
      if (!window.confirm("Delete this prompt?")) return;
      try {
        await deleteCustomPrompt(prompt.id);
        await renderCustomPrompts();
        showToast("Prompt deleted.", "success");
      } catch {
        showToast("Failed to delete prompt.", "error");
      }
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    item.appendChild(nameSpan);
    item.appendChild(actions);
    container.appendChild(item);
  }
}

/** Pre-fills and shows the prompt form for editing an existing prompt. */
function openEditForm(prompt: CustomPrompt): void {
  editingPromptId = prompt.id;

  const nameInput = document.getElementById("prompt-name-input") as HTMLInputElement | null;
  const templateInput = document.getElementById("prompt-template-input") as HTMLTextAreaElement | null;
  const form = document.getElementById("prompt-form");
  const newPromptBtn = document.getElementById("new-prompt-btn");

  if (nameInput) nameInput.value = prompt.name;
  if (templateInput) templateInput.value = prompt.template;
  setTemplateError(null);
  if (form) form.style.display = "block";
  if (newPromptBtn) newPromptBtn.style.display = "none";
}

function setTemplateError(message: string | null): void {
  const templateInput = document.getElementById("prompt-template-input") as HTMLTextAreaElement | null;
  const errorElement = document.getElementById("prompt-template-error");
  if (!templateInput || !errorElement) return;

  templateInput.setCustomValidity(message ?? "");
  if (message === null) {
    templateInput.removeAttribute("aria-invalid");
  } else {
    templateInput.setAttribute("aria-invalid", "true");
  }
  errorElement.textContent = message ?? "";
}

/** Sets up the new prompt form event listeners. */
function setupNewPromptForm(): void {
  const newPromptBtn = document.getElementById("new-prompt-btn");
  const form = document.getElementById("prompt-form");
  const saveBtn = document.getElementById("save-prompt-btn");
  const cancelBtn = document.getElementById("cancel-prompt-btn");
  const nameInput = document.getElementById("prompt-name-input") as HTMLInputElement | null;
  const templateInput = document.getElementById("prompt-template-input") as HTMLTextAreaElement | null;

  if (!newPromptBtn || !form || !saveBtn || !cancelBtn || !nameInput || !templateInput) return;

  newPromptBtn.addEventListener("click", () => {
    editingPromptId = null;
    nameInput.value = "";
    templateInput.value = "";
    setTemplateError(null);
    form.style.display = "block";
    newPromptBtn.style.display = "none";
    nameInput.focus();
  });

  cancelBtn.addEventListener("click", () => {
    editingPromptId = null;
    nameInput.value = "";
    templateInput.value = "";
    setTemplateError(null);
    form.style.display = "none";
    newPromptBtn.style.display = "inline-flex";
  });

  templateInput.addEventListener("input", () => {
    if (templateInput.validationMessage === CUSTOM_PROMPT_DATA_PLACEHOLDER_ERROR) {
      setTemplateError(validateCustomPromptTemplate(templateInput.value.trim()));
    }
  });

  saveBtn.addEventListener("click", async () => {
    const nameValue = nameInput.value.trim();
    const templateValue = templateInput.value.trim();

    if (!nameValue) {
      showToast("Prompt name is required.", "error");
      nameInput.focus();
      return;
    }

    if (!templateValue) {
      showToast("Template is required.", "error");
      templateInput.focus();
      return;
    }

    const templateError = validateCustomPromptTemplate(templateValue);
    if (templateError) {
      setTemplateError(templateError);
      showToast(templateError, "error");
      templateInput.focus();
      return;
    }

    setTemplateError(null);

    const id = editingPromptId ?? crypto.randomUUID();
    const prompt: CustomPrompt = { id, name: nameValue, template: templateValue };

    try {
      await saveCustomPrompt(prompt);
      showToast(editingPromptId ? "Prompt updated." : "Prompt saved.", "success");
      editingPromptId = null;
      nameInput.value = "";
      templateInput.value = "";
      setTemplateError(null);
      form.style.display = "none";
      newPromptBtn.style.display = "inline-flex";
      await renderCustomPrompts();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("QUOTA_BYTES")) {
        showToast("Storage full. Delete prompts to save new ones.", "error");
      } else if (message === CUSTOM_PROMPT_DATA_PLACEHOLDER_ERROR) {
        setTemplateError(message);
        showToast(message, "error");
        templateInput.focus();
      } else {
        showToast("Failed to save prompt. Please try again.", "error");
      }
    }
  });
}

function removeFromStorage(area: chrome.storage.StorageArea, keys: string[]): Promise<void> {
  const { promise, resolve, reject } = Promise.withResolvers<void>();
  area.remove(keys, () => {
    if (chrome.runtime.lastError) {
      reject(new Error(chrome.runtime.lastError.message));
    } else {
      resolve();
    }
  });
  return promise;
}

async function clearAllTrackPullData(): Promise<void> {
  const customPrompts = await loadCustomPrompts();
  const customPromptKeys = customPrompts.map((prompt) => CUSTOM_PROMPT_KEY_PREFIX + prompt.id);
  const localKeys = Object.values(STORAGE_KEYS);
  const syncKeys = [STORAGE_KEYS.AI_SERVICE, CUSTOM_PROMPT_IDS_KEY, ...customPromptKeys];

  await Promise.all([
    removeFromStorage(chrome.storage.local, localKeys),
    removeFromStorage(chrome.storage.sync, syncKeys),
    clearAllBulkImportedSessions(),
    clearAllArchiveExports(),
  ]);
}

function resetPromptForm(): void {
  const form = document.getElementById("prompt-form");
  const newPromptBtn = document.getElementById("new-prompt-btn");
  const nameInput = document.getElementById("prompt-name-input") as HTMLInputElement | null;
  const templateInput = document.getElementById("prompt-template-input") as HTMLTextAreaElement | null;

  editingPromptId = null;
  if (nameInput) nameInput.value = "";
  if (templateInput) templateInput.value = "";
  setTemplateError(null);
  if (form) form.style.display = "none";
  if (newPromptBtn) newPromptBtn.style.display = "inline-flex";
}

function setupPrivacyActions(): void {
  const clearAllBtn = document.getElementById("clear-all-data-btn") as HTMLButtonElement | null;
  if (!clearAllBtn) return;

  clearAllBtn.addEventListener("click", async () => {
    const confirmed = window.confirm(
      "Clear all TrackPull data from this browser, including current session, history, bulk imports, portal archive exports, preferences, and custom prompts?"
    );
    if (!confirmed) return;

    clearAllBtn.disabled = true;
    try {
      await clearAllTrackPullData();
      resetPromptForm();
      await renderCustomPrompts();
      await restoreAiPreference();
      showToast("All TrackPull data cleared.", "success");
    } catch (err) {
      console.error("Failed to clear TrackPull data:", err);
      showToast("Failed to clear all TrackPull data.", "error");
    } finally {
      clearAllBtn.disabled = false;
    }
  });
}

/** Restores the AI service preference from chrome.storage.sync. */
async function restoreAiPreference(): Promise<void> {
  const select = document.getElementById("options-ai-service") as HTMLSelectElement | null;
  if (!select) return;

  const result = await chrome.storage.sync.get([STORAGE_KEYS.AI_SERVICE]);
  const savedService = result[STORAGE_KEYS.AI_SERVICE] as string | undefined;
  select.value = savedService ?? "ChatGPT";

  select.onchange = () => {
    chrome.storage.sync.set({ [STORAGE_KEYS.AI_SERVICE]: select.value });
  };
}

type PortalArchiveItemStatus = "pending" | "importing" | "exported" | "failed";
type PortalArchiveJobState = "idle" | "scanning" | "running" | "paused" | "complete" | "cancelled";

interface PortalGraphQLFetchResponse {
  success: boolean;
  data?: {
    data?: Record<string, unknown>;
    errors?: Array<{ message: string }>;
  };
  error?: string;
}

interface PortalActivityPage {
  records: PortalArchiveActivity[];
  itemCount: number;
  totalCount: number | null;
  hasNextPage: boolean | null;
}

interface PortalArchiveActivity extends ActivitySummary {
  unsupportedReason?: string;
}

interface PortalArchiveItem extends ActivitySummary {
  status: PortalArchiveItemStatus;
  detail: string;
  reportId?: string;
  shotCount?: number;
  error?: string;
  updatedAt?: number;
}

interface PortalArchiveJob {
  id: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  state: PortalArchiveJobState;
  total: number;
  exported: number;
  failed: number;
  unsupported: number;
  currentActivityId?: string;
  lastError?: string;
  items: PortalArchiveItem[];
  unsupportedItems: PortalArchiveActivity[];
}

interface PortalArchiveSaveResult {
  success: boolean;
  reportId?: string;
  shotCount?: number;
  error?: string;
}

interface PortalArchiveExportPreferences {
  includeAverages: boolean;
  unitChoice: UnitChoice;
  surface: "Grass" | "Mat";
}

const PORTAL_ARCHIVE_THROTTLE_MS = 500;
const PORTAL_URL_PATTERN = "https://portal.trackmangolf.com/*";
const PORTAL_HOME_URL = "https://portal.trackmangolf.com/player/activities";

let activePortalArchiveJob: PortalArchiveJob | null = null;
let portalArchiveRunning = false;
let portalArchivePauseRequested = false;
let portalArchiveCancelRequested = false;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function wait(ms: number): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, ms);
  return promise;
}

function isPortalAuthMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("unauthorized") ||
    normalized.includes("not authorized") ||
    normalized.includes("unauthenticated") ||
    normalized.includes("not logged in");
}

function isPortalBridgeUnavailableMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("could not establish connection") ||
    normalized.includes("receiving end does not exist");
}

function formatPortalArchiveError(message: string): string {
  if (isPortalBridgeUnavailableMessage(message)) {
    return "Refresh the Trackman Portal tab, then return to settings.";
  }
  return isPortalAuthMessage(message)
    ? "Session expired — log into portal.trackmangolf.com, then resume."
    : message;
}

function getActivityType(record: Record<string, unknown>): string | null {
  if (typeof record.__typename === "string") return record.__typename;
  if (typeof record.type === "string") return record.type;
  if (typeof record.kind === "string") return record.kind;
  return null;
}

function getCourseName(record: Record<string, unknown>): string | null {
  const course = record.course;
  if (!isRecord(course)) return null;
  if (typeof course.displayName === "string" && course.displayName.trim()) {
    return course.displayName;
  }
  if (typeof course.name === "string" && course.name.trim()) {
    return course.name;
  }
  return null;
}

function normalizePortalArchiveRecord(value: unknown): PortalArchiveActivity | null {
  if (!isRecord(value) || typeof value.id !== "string") return null;

  const rawDate = value.time ?? value.date;
  const rawType = getActivityType(value);
  const rawKind = typeof value.kind === "string" ? value.kind : null;
  const supportedType = isSupportedPortalActivityType(rawType)
    ? rawType
    : isSupportedPortalActivityType(rawKind)
      ? rawKind
      : null;

  return {
    id: value.id,
    date: typeof rawDate === "string" ? rawDate : "",
    strokeCount: typeof value.strokeCount === "number" ? value.strokeCount : null,
    type: supportedType ?? rawType ?? rawKind,
    courseName: getCourseName(value),
    unsupportedReason: supportedType ? undefined : "Unsupported portal activity type",
  };
}

function extractPortalActivityPage(data: unknown): PortalActivityPage {
  const emptyPage: PortalActivityPage = {
    records: [],
    itemCount: 0,
    totalCount: null,
    hasNextPage: null,
  };
  if (!isRecord(data)) return emptyPage;

  const me = isRecord(data.me) ? data.me : undefined;
  const roots = [me?.activities, data.activities];
  for (const root of roots) {
    let candidates: unknown[] = [];
    let totalCount: number | null = null;
    let hasNextPage: boolean | null = null;

    if (Array.isArray(root)) {
      candidates = root;
    } else if (isRecord(root)) {
      totalCount = typeof root.totalCount === "number" ? root.totalCount : null;
      if (isRecord(root.pageInfo) && typeof root.pageInfo.hasNextPage === "boolean") {
        hasNextPage = root.pageInfo.hasNextPage;
      }
      if (Array.isArray(root.items)) {
        candidates = root.items;
      } else if (Array.isArray(root.nodes)) {
        candidates = root.nodes;
      } else if (Array.isArray(root.edges)) {
        candidates = root.edges.map((edge) => isRecord(edge) ? edge.node : null);
      }
    }

    if (candidates.length > 0 || totalCount !== null || hasNextPage !== null) {
      return {
        records: candidates
          .map(normalizePortalArchiveRecord)
          .filter((activity): activity is PortalArchiveActivity => Boolean(activity)),
        itemCount: candidates.length,
        totalCount,
        hasNextPage,
      };
    }
  }

  return emptyPage;
}

async function sendPortalGraphQL(
  tabId: number,
  candidate: FetchActivitiesQueryCandidate,
  variables?: Record<string, unknown>
): Promise<PortalGraphQLFetchResponse> {
  return chrome.tabs.sendMessage(tabId, {
    type: RUNTIME_MESSAGE_TYPES.PORTAL_GRAPHQL_FETCH,
    query: candidate.query,
    variables,
  }) as Promise<PortalGraphQLFetchResponse>;
}

function responseContainsMeasurement(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(responseContainsMeasurement);
  if (!isRecord(value)) return false;

  if (value.measurement || value.Measurement || value.NormalizedMeasurement) {
    return true;
  }

  return Object.entries(value).some(([key, nested]) => {
    if (key === "measurement" || key === "Measurement" || key === "NormalizedMeasurement") {
      return false;
    }
    return responseContainsMeasurement(nested);
  });
}

async function fetchPortalActivityPayloads(
  tabId: number,
  activityId: string
): Promise<Array<NonNullable<PortalGraphQLFetchResponse["data"]>>> {
  const payloads: Array<NonNullable<PortalGraphQLFetchResponse["data"]>> = [];
  let firstError: string | undefined;

  for (const candidate of IMPORT_SESSION_QUERY_CANDIDATES) {
    const response = await chrome.tabs.sendMessage(tabId, {
      type: RUNTIME_MESSAGE_TYPES.PORTAL_GRAPHQL_FETCH,
      query: candidate.query,
      variables: { id: activityId },
    }) as PortalGraphQLFetchResponse;

    if (!response?.success) {
      firstError = firstError ?? response?.error ?? "Failed to fetch activity";
      continue;
    }

    const graphQLErrors = response.data?.errors ?? [];
    if (graphQLErrors.length > 0) {
      firstError = firstError ?? graphQLErrors[0].message;
      continue;
    }

    if (response.data) {
      payloads.push(response.data);
      if (responseContainsMeasurement(response.data.data?.node)) {
        break;
      }
    }
  }

  if (payloads.length === 0) {
    throw new Error(formatPortalArchiveError(firstError ?? "Failed to fetch activity"));
  }

  return payloads;
}

function appendPortalActivities(
  supported: Map<string, PortalArchiveActivity>,
  unsupported: Map<string, PortalArchiveActivity>,
  records: PortalArchiveActivity[]
): void {
  for (const record of records) {
    if (record.unsupportedReason) {
      if (!unsupported.has(record.id)) unsupported.set(record.id, record);
    } else if (!supported.has(record.id)) {
      supported.set(record.id, record);
    }
  }
}

async function fetchPortalArchiveActivitiesForCandidate(
  tabId: number,
  candidate: FetchActivitiesQueryCandidate
): Promise<{ supported: PortalArchiveActivity[]; unsupported: PortalArchiveActivity[]; error?: string }> {
  const supported = new Map<string, PortalArchiveActivity>();
  const unsupported = new Map<string, PortalArchiveActivity>();

  if (!candidate.paginated) {
    const response = await sendPortalGraphQL(tabId, candidate);
    if (!response?.success) return { supported: [], unsupported: [], error: response?.error ?? "Failed to fetch activities" };
    const graphQLErrors = response.data?.errors ?? [];
    if (graphQLErrors.length > 0) return { supported: [], unsupported: [], error: graphQLErrors[0].message };
    appendPortalActivities(supported, unsupported, extractPortalActivityPage(response.data?.data).records);
    return { supported: [...supported.values()], unsupported: [...unsupported.values()] };
  }

  let skip = 0;
  for (let page = 0; page < FETCH_ACTIVITIES_MAX_PAGES; page += 1) {
    const response = await sendPortalGraphQL(tabId, candidate, {
      skip,
      take: FETCH_ACTIVITIES_PAGE_SIZE,
    });
    if (!response?.success) return { supported: [], unsupported: [], error: response?.error ?? "Failed to fetch activities" };
    const graphQLErrors = response.data?.errors ?? [];
    if (graphQLErrors.length > 0) return { supported: [], unsupported: [], error: graphQLErrors[0].message };

    const pageData = extractPortalActivityPage(response.data?.data);
    appendPortalActivities(supported, unsupported, pageData.records);
    const consumedCount = skip + pageData.itemCount;

    if (
      pageData.hasNextPage === false ||
      pageData.itemCount === 0 ||
      (pageData.hasNextPage === null && pageData.itemCount < FETCH_ACTIVITIES_PAGE_SIZE) ||
      (pageData.totalCount !== null && consumedCount >= pageData.totalCount)
    ) {
      return { supported: [...supported.values()], unsupported: [...unsupported.values()] };
    }

    skip = consumedCount;
    await wait(PORTAL_ARCHIVE_THROTTLE_MS);
  }

  return { supported: [...supported.values()], unsupported: [...unsupported.values()] };
}

async function fetchPortalArchiveActivities(
  tabId: number
): Promise<{ supported: PortalArchiveActivity[]; unsupported: PortalArchiveActivity[] }> {
  const allPageCandidate = FETCH_ACTIVITIES_QUERY_CANDIDATES.find((candidate) => candidate.label.includes("all-page"));
  const orderedCandidates = [
    ...(allPageCandidate ? [allPageCandidate] : []),
    ...FETCH_ACTIVITIES_QUERY_CANDIDATES.filter((candidate) => candidate !== allPageCandidate),
  ];
  let firstError: string | undefined;

  for (const candidate of orderedCandidates) {
    const result = await fetchPortalArchiveActivitiesForCandidate(tabId, candidate);
    if (result.error) {
      firstError = firstError ?? result.error;
      continue;
    }
    return { supported: result.supported, unsupported: result.unsupported };
  }

  throw new Error(formatPortalArchiveError(firstError ?? "No activities found"));
}

function getArchiveItemDetail(activity: ActivitySummary): string {
  if (activity.courseName?.trim()) return activity.courseName.trim();
  return activity.strokeCount === null ? "" : `${activity.strokeCount} shots`;
}

function createPortalArchiveJob(
  supported: PortalArchiveActivity[],
  unsupportedItems: PortalArchiveActivity[],
  now = Date.now()
): PortalArchiveJob {
  const items: PortalArchiveItem[] = supported.map((activity) => ({
    id: activity.id,
    date: activity.date,
    strokeCount: activity.strokeCount,
    type: activity.type,
    courseName: activity.courseName,
    status: "pending",
    detail: getArchiveItemDetail(activity),
  }));

  return {
    id: `archive-${now.toString(36)}`,
    createdAt: now,
    updatedAt: now,
    state: "idle",
    total: items.length,
    exported: 0,
    failed: 0,
    unsupported: unsupportedItems.length,
    items,
    unsupportedItems,
  };
}

function recalculatePortalArchiveJob(job: PortalArchiveJob, now = Date.now()): PortalArchiveJob {
  return {
    ...job,
    updatedAt: now,
    total: job.items.length,
    exported: job.items.filter((item) => item.status === "exported").length,
    failed: job.items.filter((item) => item.status === "failed").length,
    unsupported: job.unsupportedItems.length,
  };
}

function toArchiveExportItem(item: PortalArchiveItem): ArchiveExportItem {
  return {
    activityId: item.id,
    date: item.date,
    type: item.type,
    detail: item.detail,
    status: item.status === "importing" ? "exporting" : item.status,
    reportId: item.reportId,
    shotCount: item.shotCount,
    error: item.error,
    failureKind: item.status === "failed" ? "unknown" : undefined,
    updatedAt: item.updatedAt,
  };
}

function toUnsupportedArchiveExportItem(item: PortalArchiveActivity): ArchiveExportItem {
  return {
    activityId: item.id,
    date: item.date,
    type: item.type,
    detail: getArchiveItemDetail(item),
    status: "unsupported",
    error: item.unsupportedReason ?? "Unsupported portal activity type",
    failureKind: "unsupported",
    unsupportedReason: item.type === null ? "missing-activity-type" : "unsupported-activity-type",
  };
}

function toArchiveExportJob(job: PortalArchiveJob): ArchiveExportJob {
  const items = [
    ...job.items.map(toArchiveExportItem),
    ...job.unsupportedItems.map(toUnsupportedArchiveExportItem),
  ];
  const state = job.state === "scanning" ? "running" : job.state;
  return {
    id: job.id,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    state,
    total: items.length,
    pending: items.filter((item) => item.status === "pending").length,
    exported: items.filter((item) => item.status === "exported").length,
    failed: items.filter((item) => item.status === "failed").length,
    unsupported: items.filter((item) => item.status === "unsupported").length,
    currentActivityId: job.currentActivityId,
    lastError: job.lastError,
    items,
  };
}


function recoverPortalArchiveJob(job: PortalArchiveJob): PortalArchiveJob {
  if (job.state !== "running" && job.state !== "scanning" && !job.items.some((item) => item.status === "importing")) {
    return job;
  }

  return recalculatePortalArchiveJob({
    ...job,
    state: "paused",
    currentActivityId: undefined,
    items: job.items.map((item) => item.status === "importing"
      ? { ...item, status: "pending", updatedAt: Date.now() }
      : item),
    lastError: "Paused after settings was reopened.",
  });
}

async function loadPortalArchiveJob(): Promise<PortalArchiveJob | null> {
  const result = await chrome.storage.local.get([STORAGE_KEYS.PORTAL_ARCHIVE_EXPORT_STATUS]);
  return (result[STORAGE_KEYS.PORTAL_ARCHIVE_EXPORT_STATUS] as PortalArchiveJob | undefined) ?? null;
}

async function savePortalArchiveJob(job: PortalArchiveJob | null): Promise<void> {
  activePortalArchiveJob = job;
  if (job) {
    await chrome.storage.local.set({ [STORAGE_KEYS.PORTAL_ARCHIVE_EXPORT_STATUS]: job });
    const archiveJob = toArchiveExportJob(job);
    await putArchiveExportJob(archiveJob);
    await Promise.all(archiveJob.items.map((item, sortIndex) => (
      putArchiveExportItem(archiveJob.id, item, sortIndex)
    )));
  } else {
    await chrome.storage.local.remove(STORAGE_KEYS.PORTAL_ARCHIVE_EXPORT_STATUS);
  }
  renderPortalArchiveJob(job);
}

function getNextPortalArchiveItem(job: PortalArchiveJob): PortalArchiveItem | null {
  return job.items.find((item) => item.status === "pending") ?? null;
}

function updatePortalArchiveItem(
  job: PortalArchiveJob,
  activityId: string,
  patch: Partial<PortalArchiveItem>,
  now = Date.now()
): PortalArchiveJob {
  const nextJob = recalculatePortalArchiveJob({
    ...job,
    items: job.items.map((item) => item.id === activityId
      ? { ...item, ...patch, updatedAt: now }
      : item),
    currentActivityId: patch.status === "importing" ? activityId : job.currentActivityId,
  }, now);

  if (patch.status && patch.status !== "importing" && nextJob.currentActivityId === activityId) {
    return { ...nextJob, currentActivityId: undefined };
  }
  return nextJob;
}

async function findPortalTab(): Promise<chrome.tabs.Tab | null> {
  const tabs = await chrome.tabs.query({ url: PORTAL_URL_PATTERN });
  return tabs.find((tab) => typeof tab.id === "number") ?? null;
}

async function requirePortalTab(): Promise<chrome.tabs.Tab | null> {
  let granted = await hasPortalPermission();
  if (!granted) {
    granted = await requestPortalPermission();
  }
  if (!granted) {
    showToast("Portal access is required before exporting.", "error");
    return null;
  }

  const tab = await findPortalTab();
  if (!tab) {
    chrome.tabs.create({ url: PORTAL_HOME_URL });
    showToast("Log into Trackman Portal, then return to settings.", "error");
    return null;
  }
  return tab;
}

function renderPortalArchiveJob(job: PortalArchiveJob | null = activePortalArchiveJob): void {
  activePortalArchiveJob = job;
  const startBtn = document.getElementById("portal-archive-start-btn") as HTMLButtonElement | null;
  const pauseBtn = document.getElementById("portal-archive-pause-btn") as HTMLButtonElement | null;
  const resumeBtn = document.getElementById("portal-archive-resume-btn") as HTMLButtonElement | null;
  const cancelBtn = document.getElementById("portal-archive-cancel-btn") as HTMLButtonElement | null;
  const retryBtn = document.getElementById("portal-archive-retry-btn") as HTMLButtonElement | null;
  const downloadBtn = document.getElementById("portal-archive-download-btn") as HTMLButtonElement | null;
  const progressBar = document.getElementById("portal-archive-progress-bar") as HTMLDivElement | null;
  const progressTrack = document.querySelector<HTMLElement>(".portal-archive-progress-track");
  const progressText = document.getElementById("portal-archive-progress-text");
  const detail = document.getElementById("portal-archive-detail");

  const running = portalArchiveRunning || job?.state === "scanning" || job?.state === "running";
  if (startBtn) startBtn.disabled = running;
  if (pauseBtn) pauseBtn.disabled = !portalArchiveRunning || job?.state !== "running";
  if (resumeBtn) resumeBtn.disabled = portalArchiveRunning || job?.state !== "paused";
  if (cancelBtn) cancelBtn.disabled = !job || job.state === "complete" || job.state === "cancelled";
  if (retryBtn) retryBtn.disabled = portalArchiveRunning || !job || job.failed === 0;
  const artifactItemCount = job ? job.exported + job.failed + job.unsupported : 0;
  if (downloadBtn) downloadBtn.disabled = portalArchiveRunning || artifactItemCount === 0;

  const completed = job ? job.exported + job.failed : 0;
  const percent = job && job.total > 0 ? Math.round((completed / job.total) * 100) : 0;
  if (progressBar) progressBar.style.width = `${percent}%`;
  if (progressTrack) progressTrack.setAttribute("aria-valuenow", String(percent));

  if (!job) {
    if (progressText) progressText.textContent = "No archive export has started.";
    if (detail) detail.textContent = "Open Trackman Portal in another tab before starting.";
    return;
  }

  const parts = [`${completed} / ${job.total} processed`, `${job.exported} exported`];
  if (job.failed > 0) parts.push(`${job.failed} failed`);
  if (job.unsupported > 0) parts.push(`${job.unsupported} unsupported skipped`);
  if (progressText) progressText.textContent = `${job.state}: ${parts.join(" | ")}`;

  if (detail) {
    const current = job.currentActivityId ? ` Current activity: ${job.currentActivityId}.` : "";
    detail.textContent = `${job.lastError ?? "CSV, manifest, and failure report artifacts are generated locally from saved snapshots."}${current}`;
  }
}

function saveBulkImportedArchiveSession(
  jobId: string,
  activityId: string,
  graphqlPayloads: Array<NonNullable<PortalGraphQLFetchResponse["data"]>>
): Promise<PortalArchiveSaveResult> {
  const { promise, resolve } = Promise.withResolvers<PortalArchiveSaveResult>();
  chrome.runtime.sendMessage({
    type: RUNTIME_MESSAGE_TYPES.SAVE_ARCHIVE_EXPORTED_SESSION,
    jobId,
    activityId,
    graphqlPayloads,
  }, (response: PortalArchiveSaveResult | undefined) => {
    if (chrome.runtime.lastError) {
      resolve({ success: false, error: chrome.runtime.lastError.message });
      return;
    }
    resolve(response ?? { success: false, error: "No response from service worker" });
  });
  return promise;
}

async function runPortalArchiveJob(tabId: number, startingJob: PortalArchiveJob): Promise<void> {
  if (portalArchiveRunning) return;
  portalArchiveRunning = true;
  portalArchivePauseRequested = false;
  portalArchiveCancelRequested = false;

  let job = recalculatePortalArchiveJob({
    ...startingJob,
    state: "running",
    lastError: undefined,
    completedAt: undefined,
  });
  await savePortalArchiveJob(job);

  try {
    while (true) {
      if (portalArchiveCancelRequested) {
        job = recalculatePortalArchiveJob({ ...job, state: "cancelled", currentActivityId: undefined });
        await savePortalArchiveJob(job);
        showToast("Portal archive export cancelled.", "success");
        break;
      }

      if (portalArchivePauseRequested) {
        job = recalculatePortalArchiveJob({
          ...job,
          state: "paused",
          currentActivityId: undefined,
          items: job.items.map((item) => item.status === "importing"
            ? { ...item, status: "pending", updatedAt: Date.now() }
            : item),
        });
        await savePortalArchiveJob(job);
        showToast("Portal archive export paused.", "success");
        break;
      }

      const nextItem = getNextPortalArchiveItem(job);
      if (!nextItem) {
        job = recalculatePortalArchiveJob({
          ...job,
          state: "complete",
          completedAt: Date.now(),
          currentActivityId: undefined,
        });
        await savePortalArchiveJob(job);
        showToast(`Portal archive complete: ${job.exported} exported, ${job.failed} failed.`, job.failed ? "error" : "success");
        break;
      }

      job = updatePortalArchiveItem(job, nextItem.id, {
        status: "importing",
        error: undefined,
      });
      await savePortalArchiveJob(job);

      try {
        const payloads = await fetchPortalActivityPayloads(tabId, nextItem.id);
        const result = await saveBulkImportedArchiveSession(job.id, nextItem.id, payloads);
        if (result.success && result.reportId) {
          job = updatePortalArchiveItem(job, nextItem.id, {
            status: "exported",
            reportId: result.reportId,
            shotCount: result.shotCount,
            error: undefined,
          });
        } else {
          const message = formatPortalArchiveError(result.error ?? "Import failed");
          job = updatePortalArchiveItem(job, nextItem.id, {
            status: "failed",
            error: message,
          });
          job = { ...job, lastError: message };
          if (isPortalAuthMessage(message)) {
            job = recalculatePortalArchiveJob({ ...job, state: "paused", currentActivityId: undefined });
            await savePortalArchiveJob(job);
            showToast(message, "error");
            break;
          }
        }
      } catch (err) {
        const message = formatPortalArchiveError(err instanceof Error && err.message ? err.message : "Unable to fetch activity");
        job = updatePortalArchiveItem(job, nextItem.id, {
          status: "failed",
          error: message,
        });
        job = { ...job, lastError: message };
        if (isPortalAuthMessage(message)) {
          job = recalculatePortalArchiveJob({ ...job, state: "paused", currentActivityId: undefined });
          await savePortalArchiveJob(job);
          showToast(message, "error");
          break;
        }
      }

      await savePortalArchiveJob(job);
      await wait(PORTAL_ARCHIVE_THROTTLE_MS);
    }
  } finally {
    portalArchiveRunning = false;
    renderPortalArchiveJob(job);
  }
}

async function startPortalArchiveExport(): Promise<void> {
  if (portalArchiveRunning) return;
  const tab = await requirePortalTab();
  if (!tab?.id) return;

  const previousJob = activePortalArchiveJob;
  let job = createPortalArchiveJob([], []);
  try {
    job = { ...job, state: "scanning", lastError: "Scanning visible portal activities..." };
    await savePortalArchiveJob(job);
    const scan = await fetchPortalArchiveActivities(tab.id);
    if (previousJob) {
      await clearArchiveExportJob(previousJob.id).catch((err) => {
        console.warn("Could not clear previous portal archive snapshots:", err);
      });
    }
    await clearArchiveExportJob(job.id).catch(() => undefined);
    job = createPortalArchiveJob(scan.supported, scan.unsupported);
    await clearArchiveExportJob(job.id).catch(() => undefined);
    await savePortalArchiveJob(job);
    if (job.total === 0) {
      job = recalculatePortalArchiveJob({
        ...job,
        state: "complete",
        completedAt: Date.now(),
        lastError: "No supported Course Play or Map My Bag sessions were found.",
      });
      await savePortalArchiveJob(job);
      showToast("No supported portal sessions found.", "error");
      return;
    }
    await runPortalArchiveJob(tab.id, job);
  } catch (err) {
    const message = formatPortalArchiveError(err instanceof Error && err.message ? err.message : "Portal archive export failed");
    job = recalculatePortalArchiveJob({ ...job, state: "paused", lastError: message });
    await savePortalArchiveJob(job);
    showToast(message, "error");
  }
}

async function resumePortalArchiveExport(): Promise<void> {
  if (!activePortalArchiveJob || portalArchiveRunning) return;
  const tab = await requirePortalTab();
  if (!tab?.id) return;
  await runPortalArchiveJob(tab.id, activePortalArchiveJob);
}

async function retryFailedPortalArchiveExport(): Promise<void> {
  if (!activePortalArchiveJob || portalArchiveRunning) return;
  const retryJob = recalculatePortalArchiveJob({
    ...activePortalArchiveJob,
    state: "paused",
    lastError: undefined,
    items: activePortalArchiveJob.items.map((item) => item.status === "failed"
      ? { ...item, status: "pending", error: undefined, updatedAt: Date.now() }
      : item),
  });
  await savePortalArchiveJob(retryJob);
  await resumePortalArchiveExport();
}

async function cancelPortalArchiveExport(): Promise<void> {
  if (!activePortalArchiveJob) return;
  if (portalArchiveRunning) {
    portalArchiveCancelRequested = true;
    return;
  }
  await savePortalArchiveJob(recalculatePortalArchiveJob({
    ...activePortalArchiveJob,
    state: "cancelled",
    currentActivityId: undefined,
  }));
  showToast("Portal archive export cancelled.", "success");
}

async function readPortalArchiveExportPreferences(): Promise<PortalArchiveExportPreferences> {
  const result = await chrome.storage.local.get([
    STORAGE_KEYS.SPEED_UNIT,
    STORAGE_KEYS.DISTANCE_UNIT,
    STORAGE_KEYS.HITTING_SURFACE,
    STORAGE_KEYS.INCLUDE_AVERAGES,
  ]);
  const speed = result[STORAGE_KEYS.SPEED_UNIT] === "m/s" ? "m/s" : DEFAULT_UNIT_CHOICE.speed;
  const distance = result[STORAGE_KEYS.DISTANCE_UNIT] === "meters" ? "meters" : DEFAULT_UNIT_CHOICE.distance;
  const surface = result[STORAGE_KEYS.HITTING_SURFACE] === "Grass" ? "Grass" : "Mat";
  return {
    includeAverages: result[STORAGE_KEYS.INCLUDE_AVERAGES] === undefined
      ? true
      : Boolean(result[STORAGE_KEYS.INCLUDE_AVERAGES]),
    unitChoice: { speed, distance },
    surface,
  };
}


function downloadTextArtifact(filename: string, mimeType: string, content: string): Promise<void> {
  const { promise, resolve, reject } = Promise.withResolvers<void>();
  chrome.downloads.download({
    url: `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`,
    filename,
    saveAs: false,
  }, () => {
    if (chrome.runtime.lastError) {
      reject(new Error(chrome.runtime.lastError.message));
    } else {
      resolve();
    }
  });
  return promise;
}

async function downloadPortalArchiveArtifacts(): Promise<void> {
  const job = activePortalArchiveJob;
  if (!job || job.exported + job.failed + job.unsupported === 0) {
    showToast("No portal archive artifacts to download.", "error");
    return;
  }

  const button = document.getElementById("portal-archive-download-btn") as HTMLButtonElement | null;
  if (button) button.disabled = true;

  try {
    const [sessions, failures, preferences] = await Promise.all([
      getArchiveExportSessions(job.id),
      getArchiveExportFailures(job.id),
      readPortalArchiveExportPreferences(),
    ]);
    if (sessions.length === 0 && job.failed === 0 && job.unsupported === 0) {
      showToast("No saved portal archive snapshots found.", "error");
      return;
    }

    const stamp = new Date().toISOString().slice(0, 10);
    const outputs = buildArchiveExportOutputs({
      job: toArchiveExportJob(job),
      sessions,
      failures: failures as ArchiveExportFailure[],
      options: {
        includeAverages: preferences.includeAverages,
        unitChoice: preferences.unitChoice,
        hittingSurface: preferences.surface,
        baseFilename: `TrackPull_PortalArchive_${stamp}`,
      },
    });
    for (const file of outputs.files) {
      await downloadTextArtifact(file.filename, file.mimeType, file.contents);
    }
    showToast("Portal archive artifacts downloaded.", "success");
  } catch (err) {
    console.error("Portal archive artifact download failed:", err);
    showToast("Portal archive artifact download failed.", "error");
  } finally {
    if (button) button.disabled = false;
    renderPortalArchiveJob(activePortalArchiveJob);
  }
}

async function setupPortalArchiveExport(): Promise<void> {
  const startBtn = document.getElementById("portal-archive-start-btn");
  const pauseBtn = document.getElementById("portal-archive-pause-btn");
  const resumeBtn = document.getElementById("portal-archive-resume-btn");
  const cancelBtn = document.getElementById("portal-archive-cancel-btn");
  const retryBtn = document.getElementById("portal-archive-retry-btn");
  const downloadBtn = document.getElementById("portal-archive-download-btn");
  const openPortalLink = document.getElementById("portal-archive-open-link");

  startBtn?.addEventListener("click", () => {
    void startPortalArchiveExport();
  });
  pauseBtn?.addEventListener("click", () => {
    portalArchivePauseRequested = true;
  });
  resumeBtn?.addEventListener("click", () => {
    void resumePortalArchiveExport();
  });
  cancelBtn?.addEventListener("click", () => {
    void cancelPortalArchiveExport();
  });
  retryBtn?.addEventListener("click", () => {
    void retryFailedPortalArchiveExport();
  });
  downloadBtn?.addEventListener("click", () => {
    void downloadPortalArchiveArtifacts();
  });
  openPortalLink?.addEventListener("click", (event) => {
    event.preventDefault();
    chrome.tabs.create({ url: PORTAL_HOME_URL });
  });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace !== "local" || !changes[STORAGE_KEYS.PORTAL_ARCHIVE_EXPORT_STATUS]) return;
    renderPortalArchiveJob((changes[STORAGE_KEYS.PORTAL_ARCHIVE_EXPORT_STATUS].newValue as PortalArchiveJob | undefined) ?? null);
  });

  const storedJob = await loadPortalArchiveJob();
  if (!storedJob) {
    renderPortalArchiveJob(null);
    return;
  }

  const recoveredJob = recoverPortalArchiveJob(storedJob);
  await savePortalArchiveJob(recoveredJob);
}

/** Displays a temporary toast notification. */
function showToast(message: string, type: "success" | "error"): void {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const existingToast = container.querySelector(".toast");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.setAttribute("role", type === "error" ? "alert" : "status");

  container.appendChild(toast);

  const duration = type === "error" ? 5000 : 3000;
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add("hiding");
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
}
