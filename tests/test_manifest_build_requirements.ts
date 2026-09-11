import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

type IconMap = Record<string, string>;

type ExtensionManifest = {
  manifest_version?: number;
  name?: string;
  version?: string;
  description?: string;
  permissions?: string[];
  host_permissions?: string[];
  optional_host_permissions?: string[];
  background?: { service_worker?: string };
  content_scripts?: Array<{ matches?: string[]; js?: string[]; world?: string }>;
  action?: { default_popup?: string; default_icon?: IconMap };
  options_ui?: { page?: string; open_in_tab?: boolean };
  icons?: IconMap;
};

const manifest = JSON.parse(
  readFileSync("src/manifest.json", "utf8"),
) as ExtensionManifest;

describe("MV3 manifest build requirements", () => {
  it("keeps the source manifest loadable as a Chrome MV3 extension", () => {
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toBeTruthy();
    expect(manifest.version).toBeTruthy();
    expect(manifest.description).toBeTruthy();
    expect(manifest.background?.service_worker).toBe("background.js");
    expect(manifest.background).not.toHaveProperty("page");
  });

  it("declares only bundled JavaScript paths in manifest script references", () => {
    expect(manifest.background?.service_worker).toMatch(/\.js$/);
    expect(manifest.background?.service_worker).not.toMatch(/\.ts$/);

    for (const contentScript of manifest.content_scripts ?? []) {
      expect(contentScript.matches?.length).toBeGreaterThan(0);
      expect(contentScript.world).toMatch(/^(MAIN|ISOLATED)$/);
      for (const script of contentScript.js ?? []) {
        expect(script).toMatch(/\.js$/);
        expect(script).not.toMatch(/\.ts$/);
      }
    }
  });

  it("has source files for popup HTML and every manifest icon reference", () => {
    expect(manifest.action?.default_popup).toBe("popup.html");
    expect(existsSync("src/popup/popup.html")).toBe(true);
    expect(manifest.options_ui).toBeUndefined();

    const icons = [
      ...Object.values(manifest.action?.default_icon ?? {}),
      ...Object.values(manifest.icons ?? {}),
    ];
    expect(icons.length).toBeGreaterThan(0);
    for (const icon of icons) {
      expect(icon).toMatch(/^icons\/[^/]+\.png$/);
      expect(existsSync(join("src", icon))).toBe(true);
    }
  });

  it("keeps portal origins optional and the report origin in host permissions", () => {
    expect([...(manifest.permissions ?? [])].sort()).toEqual(
      ["activeTab", "clipboardWrite", "downloads", "storage"].sort(),
    );
    expect(manifest.host_permissions).toEqual([
      "https://web-dynamic-reports.trackmangolf.com/*",
    ]);
    expect([...(manifest.optional_host_permissions ?? [])].sort()).toEqual(
      [
        "https://api.trackmangolf.com/*",
        "https://portal.trackmangolf.com/*",
      ].sort(),
    );
  });

  it("keeps the build script fatal for missing required HTML and manifest assets", () => {
    const script = readFileSync("scripts/build-extension.sh", "utf8");

    expect(script).toContain("copy_required_file");
    expect(script).toContain('copy_required_file "src/popup/popup.html"');
    expect(script).toContain("validate_manifest_assets");
    expect(script).toContain("Manifest-required asset missing from dist/");
    expect(script).not.toContain("Warning: popup.html not found");
    expect(script).not.toContain("Warning: options.html not found");
    expect(script).not.toContain("Warning: No icon files found");
  });
});
