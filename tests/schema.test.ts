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
  education: [],
};

describe("resumeSchema", () => {
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

    expect(result.courses).toEqual([]);
  });
});
