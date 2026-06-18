import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import React from "react";
import { renderToFile } from "@react-pdf/renderer";
import type { Resume } from "../resume/schema.js";
import { ResumeDocument } from "./ResumeDocument.js";

export async function renderResumePdf(
  resume: Resume,
  outputPath: string,
): Promise<void> {
  await mkdir(dirname(outputPath), { recursive: true });
  await renderToFile(<ResumeDocument resume={resume} />, outputPath);
}
