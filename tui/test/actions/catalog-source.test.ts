import { afterEach, describe, expect, it, vi } from "vitest";
import * as fsAdapter from "../../src/adapters/fs";
import {
  CATALOG_DEFAULT_GIST_ID,
  CATALOG_DEFAULT_OWNER,
} from "../../src/constants";
import { resolveCatalogSource } from "../../src/platform/catalog/source";

const ENV_KEYS = [
  "DEVKIT_CATALOG_OWNER",
  "DEVKIT_CATALOG_GIST_ID",
  "PERSONAL_SKILLS_GIST_OWNER",
  "PERSONAL_SKILLS_GIST_ID",
  "GIST_OWNER",
  "GIST_ID",
] as const;

function clearCatalogEnv(): void {
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
}

describe("catalog source", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    clearCatalogEnv();
  });

  it("uses embedded defaults when no overrides are provided", async () => {
    vi.spyOn(fsAdapter, "pathExists").mockResolvedValue(false);

    const source = await resolveCatalogSource();

    expect(source.owner).toBe(CATALOG_DEFAULT_OWNER);
    expect(source.gistId).toBe(CATALOG_DEFAULT_GIST_ID);
    expect(source.rawBaseUrl).toBe(
      `https://gist.githubusercontent.com/${CATALOG_DEFAULT_OWNER}/${CATALOG_DEFAULT_GIST_ID}/raw`,
    );
    expect(source.skillsUrl.endsWith("/skills.toml")).toBe(true);
  });

  it("accepts environment overrides", async () => {
    vi.spyOn(fsAdapter, "pathExists").mockResolvedValue(false);
    process.env.DEVKIT_CATALOG_OWNER = "override-owner";
    process.env.DEVKIT_CATALOG_GIST_ID = "override-gist";

    const source = await resolveCatalogSource();

    expect(source.owner).toBe("override-owner");
    expect(source.gistId).toBe("override-gist");
  });

  it("lets local optional file override environment values", async () => {
    process.env.DEVKIT_CATALOG_OWNER = "env-owner";
    process.env.DEVKIT_CATALOG_GIST_ID = "env-gist";
    vi.spyOn(fsAdapter, "pathExists").mockResolvedValue(true);
    vi.spyOn(fsAdapter, "readTextFile").mockResolvedValue(
      'owner = "local-owner"\ngist_id = "local-gist"\n',
    );

    const source = await resolveCatalogSource();

    expect(source.owner).toBe("local-owner");
    expect(source.gistId).toBe("local-gist");
  });
});
