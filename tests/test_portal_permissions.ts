import fs from "node:fs";
import { describe, it, expect } from "vitest";
import { PORTAL_ORIGINS } from "../src/shared/portalPermissions";

describe("portalPermissions", () => {
  it("exports PORTAL_ORIGINS with two portal domains", () => {
    expect(PORTAL_ORIGINS).toHaveLength(2);
    expect(PORTAL_ORIGINS).toContain("https://api.trackmangolf.com/*");
    expect(PORTAL_ORIGINS).toContain("https://portal.trackmangolf.com/*");
  });

  it("PORTAL_ORIGINS entries match manifest optional_host_permissions", () => {
    const manifest = JSON.parse(
      fs.readFileSync("src/manifest.json", "utf-8")
    );
    const optional = manifest.optional_host_permissions as string[];
    expect(new Set(PORTAL_ORIGINS)).toEqual(new Set(optional));
  });

  it("does not request the broad tabs permission", () => {
    const manifest = JSON.parse(
      fs.readFileSync("src/manifest.json", "utf-8")
    );
    expect(manifest.permissions).not.toContain("tabs");
    expect(manifest.permissions).toContain("activeTab");
  });
});
