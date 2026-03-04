import { loadMcpCatalogStrict } from "../adapters/catalog";
import { pathExists, readTextFile, writeTextFile } from "../adapters/fs";
import { createCodexConfigBackup } from "../core/configBackup";
import type { McpServerInfo } from "../types";

interface BlockRange {
  name: string;
  start: number;
  end: number;
  commented: boolean;
}

const MCP_HEADER = /^\s*([;#])?\s*\[mcp_servers\.([A-Za-z0-9_.-]+)\]\s*$/;

function splitLines(content: string): string[] {
  return content.split(/\r?\n/);
}

function parseMcpRanges(lines: string[]): BlockRange[] {
  const headers: Array<{ name: string; index: number; commented: boolean }> = [];

  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i]?.match(MCP_HEADER);
    if (!match?.[2]) {
      continue;
    }

    headers.push({
      name: match[2],
      index: i,
      commented: Boolean(match[1]),
    });
  }

  const ranges: BlockRange[] = [];
  for (let i = 0; i < headers.length; i += 1) {
    const current = headers[i];
    if (!current) {
      continue;
    }

    let end = lines.length - 1;
    for (let j = current.index + 1; j < lines.length; j += 1) {
      if (/^\s*(?:[;#]\s*)?\[[^\]]+\]\s*$/.test(lines[j] ?? "")) {
        end = j - 1;
        break;
      }
    }

    ranges.push({
      name: current.name,
      start: current.index,
      end,
      commented: current.commented,
    });
  }

  return ranges;
}

function commentLine(line: string): string {
  if (line.trim().length === 0) {
    return line;
  }
  if (/^\s*[;#]/.test(line)) {
    return line;
  }
  const indentMatch = line.match(/^(\s*)/);
  const indent = indentMatch?.[1] ?? "";
  const rest = line.slice(indent.length);
  return `${indent}; ${rest}`;
}

function uncommentLine(line: string): string {
  return line.replace(/^(\s*)[;#]\s?/, "$1");
}

function toCommentedBlock(block: string): string[] {
  const lines = splitLines(block.trim());
  return lines.map((line) => commentLine(line));
}

async function ensureMcpBlockPresent(configPath: string, name: string): Promise<void> {
  const content = (await pathExists(configPath)) ? await readTextFile(configPath) : "";
  const lines = splitLines(content);
  const exists = parseMcpRanges(lines).some((item) => item.name === name);
  if (exists) {
    return;
  }

  const templates = await loadMcpCatalogStrict();
  const template = templates.find((item) => item.name === name);
  if (!template) {
    throw new Error("desabilitada com aviso");
  }

  const suffix = content.endsWith("\n") || content.length === 0 ? "" : "\n";
  const blockLines = toCommentedBlock(template.block);
  const next = `${content}${suffix}\n${blockLines.join("\n")}\n`;
  await createCodexConfigBackup(configPath);
  await writeTextFile(configPath, next);
}

export async function listMcpServers(configPath: string): Promise<McpServerInfo[]> {
  if (!(await pathExists(configPath))) {
    return [];
  }

  const content = await readTextFile(configPath);
  const lines = splitLines(content);
  const blocks = parseMcpRanges(lines);

  return blocks.map((block) => ({
    name: block.name,
    enabled: !block.commented,
    blockStartLine: block.start + 1,
    blockEndLine: block.end + 1,
    headerLine: lines[block.start] ?? "",
  }));
}

export async function toggleMcpServer(
  configPath: string,
  name: string,
  enable: boolean,
): Promise<void> {
  await ensureMcpBlockPresent(configPath, name);

  const content = await readTextFile(configPath);
  const lines = splitLines(content);
  const block = parseMcpRanges(lines).find((item) => item.name === name);

  if (!block) {
    throw new Error("desabilitada com aviso");
  }

  for (let i = block.start; i <= block.end; i += 1) {
    const line = lines[i] ?? "";
    lines[i] = enable ? uncommentLine(line) : commentLine(line);
  }

  await createCodexConfigBackup(configPath);
  await writeTextFile(configPath, lines.join("\n"));
}

export async function ensureMcpBlock(configPath: string, blockLines: string[]): Promise<void> {
  const blockHeader = blockLines.find((line) => /\[mcp_servers\./.test(line));
  if (!blockHeader) {
    throw new Error("desabilitada com aviso");
  }
  const nameMatch = blockHeader.match(/\[mcp_servers\.([A-Za-z0-9_.-]+)\]/);
  if (!nameMatch?.[1]) {
    throw new Error("desabilitada com aviso");
  }

  const serverName = nameMatch[1];
  const exists = (await listMcpServers(configPath)).some((server) => server.name === serverName);
  if (exists) {
    return;
  }

  const current = (await pathExists(configPath)) ? await readTextFile(configPath) : "";
  const suffix = current.endsWith("\n") || current.length === 0 ? "" : "\n";
  const block = `${blockLines.join("\n")}\n`;
  await createCodexConfigBackup(configPath);
  await writeTextFile(configPath, `${current}${suffix}\n${block}`);
}

export async function removeMcpBlock(configPath: string, name: string): Promise<boolean> {
  if (!(await pathExists(configPath))) {
    return false;
  }

  const content = await readTextFile(configPath);
  const lines = splitLines(content);
  const block = parseMcpRanges(lines).find((item) => item.name === name);
  if (!block) {
    return false;
  }

  const next = [...lines.slice(0, block.start), ...lines.slice(block.end + 1)];
  await createCodexConfigBackup(configPath);
  await writeTextFile(configPath, next.join("\n"));
  return true;
}
