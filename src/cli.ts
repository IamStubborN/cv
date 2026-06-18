#!/usr/bin/env node
import { Command } from "commander";
import { planGeneration } from "./generation/planGeneration.js";
import { renderResumePdf } from "./pdf/renderResume.js";

const program = new Command();

program
  .name("cv-builder")
  .description("Generate PDF resumes from YAML data files.")
  .version("0.1.0");

program
  .command("generate")
  .description("Generate one resume or all resumes.")
  .option("--all", "Generate all resumes in the resume directory.")
  .option("--resume <path>", "Generate a single resume YAML file.")
  .option("--resume-dir <path>", "Directory with resume YAML files.", "example/resumes")
  .option("--output-dir <path>", "Directory for generated PDFs.", "output")
  .action(async (options) => {
    const plan = await planGeneration({
      all: Boolean(options.all),
      resumePath: options.resume,
      resumeDir: options.resumeDir,
      outputDir: options.outputDir,
    });

    for (const item of plan) {
      await renderResumePdf(item.resume, item.outputPath);
      console.log(`Generated ${item.outputPath}`);
    }
  });

await program.parseAsync();
