import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, test } from "vitest";
import { discoverResumeFiles, loadResumeFile } from "../src/resume/loadResume.js";

const minimalResumeYaml = `
id: jane-doe
fileName: Jane_Doe_Software_Engineer.pdf
profile:
  name: Jane Doe
  headline: Software Engineer
  location: Berlin, Germany
  phone: "+49 123 456"
  email: jane@example.com
  links:
    - label: LinkedIn
      url: https://linkedin.com/in/jane
employment:
  - start: Jan 2020
    end: Present
    title: Senior Software Engineer
    company: Example Inc
    location: Remote
    summary: Builds reliable backend systems.
    highlights:
      - Designed service architecture
    technologies:
      - Go
      - PostgreSQL
earlierExperience: []
skills:
  - Go
  - PostgreSQL
education: []
`;

describe("loadResumeFile", () => {
  test("parses a resume YAML file into typed resume data", async () => {
    const dir = await mkdtemp(join(tmpdir(), "cv-builder-"));
    const file = join(dir, "jane.yaml");
    await writeFile(file, minimalResumeYaml, "utf8");

    const resume = await loadResumeFile(file);

    expect(resume.id).toBe("jane-doe");
    expect(resume.fileName).toBe("Jane_Doe_Software_Engineer.pdf");
    expect(resume.profile.name).toBe("Jane Doe");
    expect(resume.employment[0]?.technologies).toEqual(["Go", "PostgreSQL"]);
  });
});

describe("discoverResumeFiles", () => {
  test("returns sorted YAML files from a directory and ignores other files", async () => {
    const dir = await mkdtemp(join(tmpdir(), "cv-builder-"));
    await mkdir(join(dir, "nested"));
    await writeFile(join(dir, "z.yaml"), minimalResumeYaml, "utf8");
    await writeFile(join(dir, "a.yml"), minimalResumeYaml, "utf8");
    await writeFile(join(dir, "notes.md"), "# ignored", "utf8");

    await expect(discoverResumeFiles(dir)).resolves.toEqual([
      join(dir, "a.yml"),
      join(dir, "z.yaml"),
    ]);
  });
});
