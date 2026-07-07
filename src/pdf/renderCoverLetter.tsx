import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import React from "react";
import { renderToFile } from "@react-pdf/renderer";
import type { Resume } from "../resume/schema.js";
import { CoverLetterDocument } from "./CoverLetterDocument.js";

export async function renderCoverLetterPdf(
  resume: Resume,
  outputPath: string,
): Promise<void> {
  if (!resume.coverLetter) {
    throw new Error(`Resume "${resume.id}" has no coverLetter section.`);
  }

  await mkdir(dirname(outputPath), { recursive: true });
  await renderToFile(<CoverLetterDocument resume={resume} />, outputPath);
}
