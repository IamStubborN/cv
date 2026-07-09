import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  atsOutputPath,
  renderResumeText,
  renderResumeTextFile,
} from "../src/text/renderResumeText.js";
import type { Resume } from "../src/resume/schema.js";

const resume: Resume = {
  id: "person",
  fileName: "Person.pdf",
  profile: {
    name: "Person",
    headline: "Software Engineer",
    location: "Remote",
    phone: "+1 555",
    email: "person@example.com",
    links: [
      {
        label: "LinkedIn",
        url: "https://linkedin.com/in/person",
      },
    ],
  },
  summary: "Builds reliable backend systems.",
  employment: [
    {
      start: "Jan 2020",
      end: "Present",
      title: "Senior Software Engineer",
      company: "Example Inc",
      location: "Remote",
      summary: "Builds modular backend services.",
      highlights: ["Designed service architecture"],
      technologies: ["Go", "PostgreSQL"],
    },
  ],
  earlierExperience: [],
  skills: ["Languages: Go", "Data: PostgreSQL"],
  education: [
    {
      start: "Sep 2014",
      end: "Jun 2018",
      title: "Bachelor of Science, Computer Science",
      institution: "Example University",
      location: "Remote",
    },
  ],
  courses: [],
};

describe("renderResumeText", () => {
  test("renders a single-column ATS-friendly plain text resume", () => {
    const text = renderResumeText(resume);

    expect(text).toContain("PERSON");
    expect(text).toContain("SUMMARY");
    expect(text).toContain("SKILLS");
    expect(text).toContain("Languages: Go");
    expect(text).toContain(
      "Senior Software Engineer, Example Inc | Jan 2020 - Present | Remote",
    );
    expect(text).toContain("- Designed service architecture");
    expect(text).toContain("Technologies: Go, PostgreSQL");
    expect(text).not.toMatch(/Languages:\n/);
  });

  test("derives the ATS output filename from the PDF filename", () => {
    expect(atsOutputPath("Andrii_Prykhodko_Software_Engineer.pdf")).toBe(
      "Andrii_Prykhodko_Software_Engineer_ATS.txt",
    );
  });

  test("writes the ATS text file to disk", async () => {
    const dir = await mkdtemp(join(tmpdir(), "cv-builder-"));
    const outputPath = join(dir, "out", "Person_ATS.txt");

    await renderResumeTextFile(resume, outputPath);

    const output = await readFile(outputPath, "utf8");
    expect(output).toContain("EXPERIENCE");
    expect(output.endsWith("\n")).toBe(true);
  });
});