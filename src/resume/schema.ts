import { z } from "zod";

const MONTH_OPTIONS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;
const MONTHS = MONTH_OPTIONS.join("|");
const MONTH_YEAR = `(?:${MONTHS}) \\d{4}`;

const monthIndex = Object.fromEntries(
  MONTH_OPTIONS.map((month, index) => [month.toLowerCase(), index]),
);

function trimmedDateSchema(pattern: RegExp, message: string) {
  return z
    .string()
    .transform((value) => value.trim())
    .pipe(z.string().regex(pattern, message));
}

const startDateStringSchema = trimmedDateSchema(
  new RegExp(`^(?:\\d{4}|${MONTH_YEAR})$`, "i"),
  "Date must be 'YYYY' or 'Mon YYYY'",
);

const endDateStringSchema = trimmedDateSchema(
  new RegExp(`^(?:Present|\\d{4}|${MONTH_YEAR})$`, "i"),
  "Date must be 'Present', 'YYYY', or 'Mon YYYY'",
);

function parseDate(value: string): Date | undefined {
  const trimmed = value.trim();

  if (/^present$/i.test(trimmed)) {
    return new Date();
  }

  const yearMatch = /^(\d{4})$/.exec(trimmed);
  if (yearMatch) {
    return new Date(Number(yearMatch[1]), 0, 1);
  }

  const monthYearMatch = new RegExp(
    `^((?:${MONTHS})) (\\d{4})$`,
    "i",
  ).exec(trimmed);
  if (monthYearMatch) {
    const month = monthIndex[monthYearMatch[1].toLowerCase()];
    return new Date(Number(monthYearMatch[2]), month, 1);
  }

  return undefined;
}

function validateChronologicalOrder(data: { start: string; end: string }) {
  const start = parseDate(data.start);
  const end = parseDate(data.end);
  return !start || !end || start <= end;
}

const linkSchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1),
});

const profileSchema = z.object({
  name: z.string().min(1),
  headline: z.string().min(1),
  location: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  links: z.array(linkSchema),
});

const employmentSchema = z
  .object({
    start: startDateStringSchema,
    end: endDateStringSchema,
    title: z.string().min(1),
    company: z.string().min(1),
    location: z.string().min(1),
    summary: z.string().default(""),
    highlights: z.array(z.string()).default([]),
    technologies: z.array(z.string()).default([]),
  })
  .refine(validateChronologicalOrder, {
    message: "End date must be on or after start date",
    path: ["end"],
  });

const datedItemSchema = z
  .object({
    start: startDateStringSchema,
    end: endDateStringSchema,
    title: z.string().min(1),
    institution: z.string().optional(),
    location: z.string().default(""),
  })
  .refine(validateChronologicalOrder, {
    message: "End date must be on or after start date",
    path: ["end"],
  });

const coverLetterSchema = z.object({
  fileName: z.string().min(1),
  greeting: z.string().default("Dear Hiring Team,"),
  paragraphs: z.array(z.string().min(1)).min(1),
  closing: z.string().default("Best regards,"),
});

export const resumeSchema = z
  .object({
    id: z.string().min(1),
    fileName: z.string().min(1),
    profile: profileSchema,
    summary: z.string().default(""),
    employment: z.array(employmentSchema),
    earlierExperience: z.array(employmentSchema).default([]),
    skills: z.array(z.string()),
    education: z.array(datedItemSchema).default([]),
    courses: z.array(datedItemSchema).default([]),
    coverLetter: coverLetterSchema.optional(),
  })
  .strict();

export type CoverLetter = z.infer<typeof coverLetterSchema>;

export type Resume = z.infer<typeof resumeSchema>;
