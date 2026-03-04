import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { listMcpServers, toggleMcpServer } from "../../src/actions/mcp";
import { buildTmpName } from "../helpers/tmp";

const createdFiles: string[] = [];

function tmpConfigPath(): string {
  const filePath = path.join(tmpdir(), `${buildTmpName("mcp-config")}.toml`);
  createdFiles.push(filePath);
  return filePath;
}

async function writeConfig(content: string): Promise<string> {
  const filePath = tmpConfigPath();
  await writeFile(filePath, content, "utf8");
  return filePath;
}

afterEach(async () => {
  await Promise.all(
    createdFiles.splice(0).map(async (filePath) => {
      await rm(filePath, { force: true });
      const dir = path.dirname(filePath);
      const base = path.basename(filePath);
      const entries = await readdir(dir);
      await Promise.all(
        entries
          .filter((entry) => entry.startsWith(`${base}.bak-`))
          .map((entry) => rm(path.join(dir, entry), { force: true })),
      );
    }),
  );
});

describe("mcp actions", () => {
  it("listMcpServers detects enabled + commented blocks", async () => {
    const configPath = await writeConfig(
      [
        "[mcp_servers.reme]",
        'command = "npx -y reme"',
        "",
        "; [mcp_servers.axon]",
        '; command = "npx -y axon-mcp"',
      ].join("\n"),
    );

    const servers = await listMcpServers(configPath);
    expect(servers).toEqual([
      expect.objectContaining({ name: "reme", enabled: true }),
      expect.objectContaining({ name: "axon", enabled: false }),
    ]);
  });

  it("toggleMcpServer adds missing block from template and toggles in same action", async () => {
    const configPath = await writeConfig(
      ["[mcp_servers.github]", 'url = "https://example.com/mcp"'].join("\n"),
    );

    await toggleMcpServer(configPath, "axon", true);
    const next = await readFile(configPath, "utf8");

    expect(next).toContain("[mcp_servers.axon]");
    expect(next).toContain('command = "axon"');
    expect(next).toContain('args = ["serve", "--watch"]');
  });

  it("toggleMcpServer affects only exact target name", async () => {
    const configPath = await writeConfig(
      [
        "; [mcp_servers.axon]",
        '; command = "axon"',
        "",
        "; [mcp_servers.axon_dev]",
        '; command = "axon-dev"',
      ].join("\n"),
    );

    await toggleMcpServer(configPath, "axon", true);
    const next = await readFile(configPath, "utf8");

    expect(next).toContain("[mcp_servers.axon]");
    expect(next).toContain("; [mcp_servers.axon_dev]");
  });

  it("keeps only latest 3 backups after repeated toggles", async () => {
    const configPath = await writeConfig(["; [mcp_servers.axon]", '; command = "axon"'].join("\n"));

    for (let i = 0; i < 6; i += 1) {
      await toggleMcpServer(configPath, "axon", i % 2 === 0);
    }

    const dir = path.dirname(configPath);
    const base = path.basename(configPath);
    const entries = await readdir(dir);
    const backups = entries.filter((entry) => entry.startsWith(`${base}.bak-`));

    expect(backups.length).toBeLessThanOrEqual(3);
  });

  it("returns short generic error when template does not exist", async () => {
    const configPath = await writeConfig('[mcp_servers.github]\nurl = "x"\n');

    await expect(toggleMcpServer(configPath, "missing", true)).rejects.toThrow(
      "desabilitada com aviso",
    );
  });
});
