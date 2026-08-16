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

  test("accepts valid date formats for employment", () => {
    const result = resumeSchema.safeParse({
      ...minimalResume,
      employment: [{ ...roleWithDates("2017", "Jan 2020") }],
    });

    expect(result.success).toBe(true);
  });

  test("accepts Present as a valid end date", () => {
    const result = resumeSchema.safeParse({
      ...minimalResume,
      employment: [
        { ...roleWithDates("Jan 2020", "Present") },
        { ...roleWithDates("Jan 2017", "Dec 2019") },
      ],
    });

    expect(result.success).toBe(true);
  });

  test("rejects invalid month abbreviations", () => {
    const result = resumeSchema.safeParse({
      ...minimalResume,
      employment: [{ ...roleWithDates("Foo 2020", "Present") }],
    });

    expect(result.success).toBe(false);
  });

  test("collapses repeated spaces inside dates", () => {
    const result = resumeSchema.safeParse({
      ...minimalResume,
      employment: [{ ...roleWithDates("Jan  2020", "Present") }],
    });

    expect(result.success).toBe(true);
    expect(result.data?.employment[0].start).toBe("Jan 2020");
  });

  test("rejects chronologically impossible date ranges", () => {
    const result = resumeSchema.safeParse({
      ...minimalResume,
      employment: [{ ...roleWithDates("Dec 2020", "Jan 2020") }],
    });

    expect(result.success).toBe(false);
  });

  test("rejects Present as a start date", () => {
    const result = resumeSchema.safeParse({
      ...minimalResume,
      employment: [{ ...roleWithDates("Present", "Jan 2020") }],
    });

    expect(result.success).toBe(false);
  });

  test("validates dates in education and courses", () => {
    const result = resumeSchema.safeParse({
      ...minimalResume,
      education: [{ ...datedItemWithDates("Sep 2014", "Jun 2018") }],
      courses: [{ ...datedItemWithDates("Mar 2024", "May 2024") }],
    });

    expect(result.success).toBe(true);
  });

  test("rejects invalid dates in education", () => {
    const result = resumeSchema.safeParse({
      ...minimalResume,
      education: [{ ...datedItemWithDates("Foo 2020", "Jun 2021") }],
    });

    expect(result.success).toBe(false);
  });

  test("rejects chronologically impossible course ranges", () => {
    const result = resumeSchema.safeParse({
      ...minimalResume,
      courses: [{ ...datedItemWithDates("May 2024", "Mar 2024") }],
    });

    expect(result.success).toBe(false);
  });

  test("rejects chronologically impossible earlier experience ranges", () => {
    const result = resumeSchema.safeParse({
      ...minimalResume,
      earlierExperience: [{ ...roleWithDates("Dec 2015", "Jan 2015") }],
    });

    expect(result.success).toBe(false);
  });

  test("treats a year-only end date as the end of that year", () => {
    const result = resumeSchema.safeParse({
      ...minimalResume,
      employment: [{ ...roleWithDates("Jun 2016", "2016") }],
    });

    expect(result.success).toBe(true);
  });

  test("normalizes surrounding whitespace and letter case in dates", () => {
    const result = resumeSchema.safeParse({
      ...minimalResume,
      employment: [{ ...roleWithDates("  jan 2020  ", " present ") }],
    });

    expect(result.success).toBe(true);
    expect(result.data?.employment[0]).toMatchObject({
      start: "Jan 2020",
      end: "Present",
    });
  });

  test.each([
    ["January 2020", "Jan 2020"],
    ["Jan. 2020", "Jan 2020"],
    ["Sept 2020", "Sep 2020"],
    ["2020-01", "Jan 2020"],
    ["2020-12", "Dec 2020"],
  ])("normalizes %s to the canonical form", (input, expected) => {
    const result = resumeSchema.safeParse({
      ...minimalResume,
      employment: [{ ...roleWithDates(input, "Present") }],
    });

    expect(result.success).toBe(true);
    expect(result.data?.employment[0].start).toBe(expected);
  });

  test.each(["current", "Now", "ongoing", "to date"])(
    "normalizes %s to Present",
    (input) => {
      const result = resumeSchema.safeParse({
        ...minimalResume,
        employment: [{ ...roleWithDates("Jan 2020", input) }],
      });

      expect(result.success).toBe(true);
      expect(result.data?.employment[0].end).toBe("Present");
    },
  );

  test("rejects an invalid month number in an ISO-style date", () => {
    const result = resumeSchema.safeParse({
      ...minimalResume,
      employment: [{ ...roleWithDates("2020-13", "Present") }],
    });

    expect(result.success).toBe(false);
  });
});

function datedItemWithDates(start: string, end: string) {
  return {
    start,
    end,
    title: "Bachelor of Science",
    institution: "Example University",
    location: "Remote",
  };
}

function roleWithDates(start: string, end: string) {
  return {
    start,
    end,
    title: "Engineer",
    company: "Example Inc",
    location: "Remote",
    summary: "",
    highlights: [],
    technologies: [],
  };
}
