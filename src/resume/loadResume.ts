import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import YAML from "yaml";
import { type Resume, resumeSchema } from "./schema.js";

export async function loadResumeFile(filePath: string): Promise<Resume> {
  const raw = await readFile(filePath, "utf8");
  const parsed = YAML.parse(raw);
  return resumeSchema.parse(parsed);
}

export async function discoverResumeFiles(resumeDir: string): Promise<string[]> {
  const entries = await readdir(resumeDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.endsWith(".yaml") || name.endsWith(".yml"))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => join(resumeDir, name));
}
