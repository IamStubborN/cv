import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { renderCoverLetterPdf } from "../src/pdf/renderCoverLetter.js";
import type { Resume } from "../src/resume/schema.js";

const baseResume: Resume = {
  id: "person",
  fileName: "Person.pdf",
  profile: {
    name: "Person",
    headline: "Software Engineer",
    location: "Remote",
    phone: "+1 555",
    email: "person@example.com",
    links: [],
  },
  summary: "",
  employment: [],
  earlierExperience: [],
  skills: [],
  education: [],
  courses: [],
  coverLetter: {
    fileName: "Person_Cover_Letter.pdf",
    greeting: "Dear Hiring Team,",
    paragraphs: ["First paragraph.", "Second paragraph."],
    closing: "Best regards,",
  },
};

describe("renderCoverLetterPdf", () => {
  test("renders a PDF from cover letter data", async () => {
    const dir = await mkdtemp(join(tmpdir(), "cv-builder-"));
    const outputPath = join(dir, "out", "Person_Cover_Letter.pdf");

    await renderCoverLetterPdf(baseResume, outputPath);

    const output = await readFile(outputPath);
    expect(output.subarray(0, 5).toString("utf8")).toBe("%PDF-");
  });

  test("throws when the resume has no cover letter", async () => {
    const dir = await mkdtemp(join(tmpdir(), "cv-builder-"));
    const outputPath = join(dir, "out", "Person_Cover_Letter.pdf");
    const resume = { ...baseResume, coverLetter: undefined };

    await expect(renderCoverLetterPdf(resume, outputPath)).rejects.toThrow(
      /no coverLetter section/,
    );
  });
});
