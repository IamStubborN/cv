import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PDFArray, PDFDict, PDFDocument, PDFName, PDFString } from "pdf-lib";
import { describe, expect, test } from "vitest";
import { renderResumePdf } from "../src/pdf/renderResume.js";
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
    links: [
      {
        label: "LinkedIn",
        url: "https://linkedin.com/in/person",
      },
      {
        label: "GitHub",
        url: "https://github.com/person",
      },
    ],
  },
  summary: "",
  employment: [],
  earlierExperience: [],
  skills: [],
  education: [],
  courses: [],
};

describe("renderResumePdf", () => {
  test("renders a PDF from resume data", async () => {
    const dir = await mkdtemp(join(tmpdir(), "cv-builder-"));
    const outputPath = join(dir, "out", "Person.pdf");

    await renderResumePdf(baseResume, outputPath);

    const output = await readFile(outputPath);
    expect(output.subarray(0, 5).toString("utf8")).toBe("%PDF-");
  });

  test("extracts ATS-friendly single-column text from the PDF", async () => {
    const dir = await mkdtemp(join(tmpdir(), "cv-builder-"));
    const outputPath = join(dir, "out", "Person.pdf");
    const resume: Resume = {
      ...baseResume,
      summary: "Builds reliable backend systems.",
      skills: ["Languages: Go", "Backend: REST"],
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
    };

    await renderResumePdf(resume, outputPath);

    const { execSync } = await import("node:child_process");
    const text = execSync(`pdftotext "${outputPath}" -`, {
      encoding: "utf8",
    });

    expect(text).toContain("Languages: Go");
    expect(text).not.toMatch(/Languages:\s*\n\s*Backend:/);
    expect(text).toContain("Senior Software Engineer, Example Inc");
    expect(text).toContain("Jan 2020 - Present");
  });

  test("extracts header contacts on one line without blank gaps", async () => {
    const dir = await mkdtemp(join(tmpdir(), "cv-builder-"));
    const outputPath = join(dir, "out", "Person.pdf");

    await renderResumePdf(baseResume, outputPath);

    const { execSync } = await import("node:child_process");
    const text = execSync(`pdftotext "${outputPath}" -`, {
      encoding: "utf8",
    });

    expect(text).toMatch(
      /\+1 555\s*·\s*person@example\.com\s*·\s*linkedin\.com\/in\/person\s*·\s*github\.com\/person/,
    );
    expect(text).not.toMatch(/\+1 555\s*\n\s*\n\s*person@example\.com/);
  });

  test("creates clickable annotations for profile contact links", async () => {
    const dir = await mkdtemp(join(tmpdir(), "cv-builder-"));
    const outputPath = join(dir, "out", "Person.pdf");

    await renderResumePdf(baseResume, outputPath);

    await expect(readPdfUris(outputPath)).resolves.toEqual(
      expect.arrayContaining([
        "mailto:person@example.com",
        "tel:+1555",
        "https://linkedin.com/in/person",
        "https://github.com/person",
      ]),
    );
  });
});

async function readPdfUris(filePath: string) {
  const pdf = await PDFDocument.load(await readFile(filePath));

  return pdf
    .getPages()
    .flatMap((page) => {
      const annotations = page.node.Annots();
      if (!(annotations instanceof PDFArray)) {
        return [];
      }

      return annotations.asArray().flatMap((annotationRef) => {
        const annotation = pdf.context.lookup(annotationRef);
        if (!(annotation instanceof PDFDict)) {
          return [];
        }

        const action = pdf.context.lookup(annotation.get(PDFName.of("A")));
        if (!(action instanceof PDFDict)) {
          return [];
        }

        const uri = action.get(PDFName.of("URI"));
        return uri instanceof PDFString ? [uri.decodeText()] : [];
      });
    });
}
