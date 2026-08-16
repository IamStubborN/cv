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
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
const MONTHS = MONTH_OPTIONS.join("|");
const MONTH_YEAR = `(?:${MONTHS}) \\d{4}`;

const monthIndex = new Map<string, number>();
for (const [index, name] of MONTH_NAMES.entries()) {
  const lower = name.toLowerCase();
  monthIndex.set(lower, index);
  monthIndex.set(lower.slice(0, 3), index);
  monthIndex.set(lower.slice(0, 4), index);
}

/** Written forms accepted for an ongoing role, all normalized to `Present`. */
const PRESENT_PATTERN = /^(?:present|current|now|ongoing|to date|till date)$/i;
const YEAR_PATTERN = /^(\d{4})$/;
/** Accepts `Jan 2020`, `Jan. 2020`, `January 2020`, `Sept 2020` and `2020-01`. */
const MONTH_YEAR_PATTERN = /^([A-Za-z]{3,9})\.?,? (\d{4})$/;
const ISO_MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

/** Rewrites the supported spellings into the canonical `Present`/`YYYY`/`Mon YYYY` forms. */
function normalizeDate(value: string): string {
  const trimmed = value.trim().replace(/\s+/g, " ");

  if (PRESENT_PATTERN.test(trimmed)) {
    return "Present";
  }

  const isoMatch = ISO_MONTH_PATTERN.exec(trimmed);
  if (isoMatch) {
    return `${MONTH_OPTIONS[Number(isoMatch[2]) - 1]} ${isoMatch[1]}`;
  }

  const monthYearMatch = MONTH_YEAR_PATTERN.exec(trimmed);
  if (monthYearMatch) {
    const month = monthIndex.get(monthYearMatch[1].toLowerCase());
    if (month !== undefined) {
      return `${MONTH_OPTIONS[month]} ${monthYearMatch[2]}`;
    }
  }

  return trimmed;
}

const DATE_FORMAT_HINT = "'YYYY' (2020), 'Mon YYYY' (Jan 2020), 'January 2020' or '2020-01'";

function dateSchema(pattern: RegExp, message: string) {
  return z
    .string()
    .transform(normalizeDate)
    .pipe(z.string().regex(pattern, message));
}

const startDateStringSchema = dateSchema(
  new RegExp(`^(?:\\d{4}|${MONTH_YEAR})$`),
  `Date must be ${DATE_FORMAT_HINT}`,
);

const endDateStringSchema = dateSchema(
  new RegExp(`^(?:Present|\\d{4}|${MONTH_YEAR})$`),
  `Date must be 'Present', ${DATE_FORMAT_HINT}`,
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
    const month = monthIndex.get(monthYearMatch[1].toLowerCase());
    if (month !== undefined) {
      return monthTimestamp(Number(monthYearMatch[2]), month);
    }
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
