import { join } from "node:path";
import { discoverResumeFiles, loadResumeFile } from "../resume/loadResume.js";
import type { Resume } from "../resume/schema.js";

export type GenerationOptions = {
  all?: boolean;
  resumePath?: string;
  resumeDir: string;
  outputDir: string;
};

export type GenerationPlanItem = {
  sourcePath: string;
  outputPath: string;
  resume: Resume;
};

export async function planGeneration(
  options: GenerationOptions,
): Promise<GenerationPlanItem[]> {
  const sourcePaths = await resolveSourcePaths(options);
  const resumes = await Promise.all(
    sourcePaths.map(async (sourcePath) => ({
      sourcePath,
      resume: await loadResumeFile(sourcePath),
    })),
  );

  return resumes.map(({ sourcePath, resume }) => ({
    sourcePath,
    outputPath: join(options.outputDir, resume.fileName),
    resume,
  }));
}

async function resolveSourcePaths(options: GenerationOptions): Promise<string[]> {
  if (options.all && options.resumePath) {
    throw new Error("Pass --all or --resume, not both.");
  }

  if (options.all) {
    return discoverResumeFiles(options.resumeDir);
  }

  if (options.resumePath) {
    return [options.resumePath];
  }

  throw new Error("Pass --all or --resume.");
}
