import { z } from "zod";
import { SHORT_GENERIC_CATALOG_ERROR } from "../../constants";
import type { McpTemplateItem, SkillCatalogItem, ToolCatalogItem } from "../../types";

const nonEmptyText = z.string().trim().min(1);
const toolNameSchema = z.enum(["openspec", "reme", "axon"]);

const skillCatalogItemSchema = z
  .object({
    name: nonEmptyText,
    install: nonEmptyText,
  })
  .strict();

const toolCatalogItemSchema = z
  .object({
    name: toolNameSchema,
    install: nonEmptyText,
    update: nonEmptyText,
    uninstall: nonEmptyText,
    cleanup: z.array(nonEmptyText),
  })
  .strict();

const mcpTemplateItemSchema = z
  .object({
    name: nonEmptyText,
    block: nonEmptyText,
  })
  .strict()
  .refine((item) => item.block.includes(`[mcp_servers.${item.name}]`), {
    message: SHORT_GENERIC_CATALOG_ERROR,
  });

function parseCatalogRows<T>(schema: z.ZodType<T>, raw: unknown[]): T[] {
  const parsed = z.array(schema).safeParse(raw);
  if (!parsed.success) {
    throw new Error(SHORT_GENERIC_CATALOG_ERROR);
  }
  return parsed.data;
}

export function parseSkillsCatalogRows(raw: unknown[]): SkillCatalogItem[] {
  const rows = parseCatalogRows(skillCatalogItemSchema, raw);
  return [...rows].sort((a, b) => a.name.localeCompare(b.name));
}

export function parseToolsCatalogRows(raw: unknown[]): ToolCatalogItem[] {
  const rows = parseCatalogRows(toolCatalogItemSchema, raw);
  return [...rows].sort((a, b) => a.name.localeCompare(b.name));
}

export function parseMcpCatalogRows(raw: unknown[]): McpTemplateItem[] {
  const rows = parseCatalogRows(mcpTemplateItemSchema, raw);
  return [...rows].sort((a, b) => a.name.localeCompare(b.name));
}
