import { mkdtemp, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, test } from "vitest";
import { planGeneration } from "../src/generation/planGeneration.js";

const resumeYaml = (id: string, fileName: string) => `
id: ${id}
fileName: ${fileName}
profile:
  name: ${id}
  headline: Software Engineer
  location: Remote
  phone: "+1 555"
  email: ${id}@example.com
  links: []
employment: []
earlierExperience: []
skills: []
education: []
`;

describe("planGeneration", () => {
  test("plans output PDFs for every resume in a directory", async () => {
    const dir = await mkdtemp(join(tmpdir(), "cv-builder-"));
    const outputDir = join(dir, "out");
    await writeFile(join(dir, "b.yaml"), resumeYaml("b", "B.pdf"), "utf8");
    await writeFile(join(dir, "a.yaml"), resumeYaml("a", "A.pdf"), "utf8");

    const plan = await planGeneration({
      all: true,
      resumeDir: dir,
      outputDir,
    });

    expect(plan.map((item) => item.resume.id)).toEqual(["a", "b"]);
    expect(plan.map((item) => item.outputPath)).toEqual([
      join(outputDir, "A.pdf"),
      join(outputDir, "B.pdf"),
    ]);
  });

  test("plans one selected resume file", async () => {
    const dir = await mkdtemp(join(tmpdir(), "cv-builder-"));
    const outputDir = join(dir, "out");
    const resumePath = join(dir, "person.yaml");
    await writeFile(resumePath, resumeYaml("person", "Person.pdf"), "utf8");

    const plan = await planGeneration({
      resumePath,
      resumeDir: join(dir, "unused"),
      outputDir,
    });

    expect(plan).toHaveLength(1);
    expect(plan[0]?.sourcePath).toBe(resumePath);
    expect(plan[0]?.outputPath).toBe(join(outputDir, "Person.pdf"));
  });

  test("requires either all resumes or one resume path", async () => {
    await expect(
      planGeneration({
        resumeDir: "data/resumes",
        outputDir: "output",
      }),
    ).rejects.toThrow("Pass --all or --resume");
  });
});
