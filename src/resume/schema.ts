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

const PRESENT_PATTERN = /^present$/i;
const YEAR_PATTERN = /^(\d{4})$/;
const MONTH_YEAR_PATTERN = new RegExp(`^((?:${MONTHS})) (\\d{4})$`, "i");

function normalizeDate(value: string): string {
  const trimmed = value.trim();

  if (PRESENT_PATTERN.test(trimmed)) {
    return "Present";
  }

  const monthYearMatch = MONTH_YEAR_PATTERN.exec(trimmed);
  if (monthYearMatch) {
    const month = monthYearMatch[1];
    return `${month[0].toUpperCase()}${month.slice(1).toLowerCase()} ${monthYearMatch[2]}`;
  }

  return trimmed;
}

function dateSchema(pattern: RegExp, message: string) {
  return z
    .string()
    .transform(normalizeDate)
    .pipe(z.string().regex(pattern, message));
}

const startDateStringSchema = dateSchema(
  new RegExp(`^(?:\\d{4}|${MONTH_YEAR})$`),
  "Date must be 'YYYY' or 'Mon YYYY'",
);

const endDateStringSchema = dateSchema(
  new RegExp(`^(?:Present|\\d{4}|${MONTH_YEAR})$`),
  "Date must be 'Present', 'YYYY', or 'Mon YYYY'",
);

function monthTimestamp(year: number, month: number): number {
  const date = new Date(Date.UTC(2000, month, 1));
  date.setUTCFullYear(year);
  return date.getTime();
}

/**
 * Resolves a date to a UTC timestamp. A year without a month is resolved to the
 * first month for `start` and the last month for `end`, so ranges such as
 * `Jun 2016 - 2016` stay valid.
 */
function parseDate(value: string, boundary: "start" | "end"): number | undefined {
  const trimmed = value.trim();

  if (PRESENT_PATTERN.test(trimmed)) {
    return Number.POSITIVE_INFINITY;
  }

  const yearMatch = YEAR_PATTERN.exec(trimmed);
  if (yearMatch) {
    return monthTimestamp(Number(yearMatch[1]), boundary === "start" ? 0 : 11);
  }

  const monthYearMatch = MONTH_YEAR_PATTERN.exec(trimmed);
  if (monthYearMatch) {
    const month = monthIndex[monthYearMatch[1].toLowerCase()];
    return monthTimestamp(Number(monthYearMatch[2]), month);
  }

  return undefined;
}

function validateChronologicalOrder(data: { start: string; end: string }) {
  const start = parseDate(data.start, "start");
  const end = parseDate(data.end, "end");
  return start !== undefined && end !== undefined && start <= end;
}

function withChronologicalDates<Schema extends z.ZodType<{ start: string; end: string }>>(
  schema: Schema,
) {
  return schema.refine(validateChronologicalOrder, {
    message: "End date must be on or after start date",
    path: ["end"],
  });
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

const employmentSchema = withChronologicalDates(
  z.object({
    start: startDateStringSchema,
    end: endDateStringSchema,
    title: z.string().min(1),
    company: z.string().min(1),
    location: z.string().min(1),
    summary: z.string().default(""),
    highlights: z.array(z.string()).default([]),
    technologies: z.array(z.string()).default([]),
  }),
);

const datedItemSchema = withChronologicalDates(
  z.object({
    start: startDateStringSchema,
    end: endDateStringSchema,
    title: z.string().min(1),
    institution: z.string().optional(),
    location: z.string().default(""),
  }),
);

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
