import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  CUSTOM_PROMPT_DATA_PLACEHOLDER_ERROR,
  loadCustomPrompts,
  saveCustomPrompt,
  validateCustomPromptTemplate,
} from "../src/shared/custom_prompts";
import type { CustomPrompt } from "../src/shared/prompt_types";

const store: Record<string, unknown> = {};

const chromeMock = {
  storage: {
    sync: {
      get: vi.fn(async (keys: string[]) => {
        const result: Record<string, unknown> = {};
        for (const key of keys) result[key] = store[key];
        return result;
      }),
      set: vi.fn(async (items: Record<string, unknown>) => {
        Object.assign(store, items);
      }),
      remove: vi.fn(async (key: string) => {
        delete store[key];
      }),
    },
  },
};

vi.stubGlobal("chrome", chromeMock);

beforeEach(() => {
  for (const key of Object.keys(store)) delete store[key];
  vi.clearAllMocks();
});

describe("custom prompt placeholder validation", () => {
  it("requires the {{DATA}} placeholder", () => {
    expect(validateCustomPromptTemplate("Analyze this data: {{DATA}}")).toBeNull();
    expect(validateCustomPromptTemplate("Analyze my swing without a placeholder")).toBe(
      CUSTOM_PROMPT_DATA_PLACEHOLDER_ERROR
    );
  });

  it("prevents saving templates that cannot receive shot data", async () => {
    const prompt: CustomPrompt = {
      id: "missing-placeholder",
      name: "Missing placeholder",
      template: "Analyze this session.",
    };

    await expect(saveCustomPrompt(prompt)).rejects.toThrow(CUSTOM_PROMPT_DATA_PLACEHOLDER_ERROR);
    await expect(loadCustomPrompts()).resolves.toEqual([]);
    expect(chromeMock.storage.sync.set).not.toHaveBeenCalled();
  });
});
