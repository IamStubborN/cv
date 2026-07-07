import { describe, expect, test } from "vitest";
import { resumeSchema } from "../src/resume/schema.js";

const minimalResume = {
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
  employment: [],
  skills: [],
};

describe("resumeSchema", () => {
  test("accepts an optional summary and defaults education to an empty list", () => {
    const result = resumeSchema.parse({
      ...minimalResume,
      summary: "Senior backend engineer focused on Go services.",
    });

    expect(result.summary).toBe("Senior backend engineer focused on Go services.");
    expect(result.education).toEqual([]);
  });

  test("accepts compact earlier experience entries", () => {
    const result = resumeSchema.safeParse({
      ...minimalResume,
      earlierExperience: [
        {
          start: "Jan 2015",
          end: "Dec 2019",
          title: "Earlier Experience",
          company: "Industrial Automation",
          location: "Remote",
          summary: "Built internal automation tools.",
          highlights: ["Automated reporting workflows"],
          technologies: ["Golang", "Python"],
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.data?.earlierExperience).toHaveLength(1);
  });

  test("defaults optional courses to an empty list", () => {
    const result = resumeSchema.parse(minimalResume);

    expect(result.summary).toBe("");
    expect(result.education).toEqual([]);
    expect(result.courses).toEqual([]);
  });

  test("accepts an optional cover letter with defaults", () => {
    const result = resumeSchema.parse({
      ...minimalResume,
      coverLetter: {
        fileName: "Person_Cover_Letter.pdf",
        paragraphs: ["First paragraph.", "Second paragraph."],
      },
    });

    expect(result.coverLetter?.greeting).toBe("Dear Hiring Team,");
    expect(result.coverLetter?.closing).toBe("Best regards,");
    expect(result.coverLetter?.paragraphs).toHaveLength(2);
  });

  test("rejects a cover letter without paragraphs", () => {
    const result = resumeSchema.safeParse({
      ...minimalResume,
      coverLetter: {
        fileName: "Person_Cover_Letter.pdf",
        paragraphs: [],
      },
    });

    expect(result.success).toBe(false);
  });
});
