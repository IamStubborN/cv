import { z } from "zod";

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

const employmentSchema = z.object({
  start: z.string().min(1),
  end: z.string().min(1),
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().min(1),
  summary: z.string().default(""),
  highlights: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
});

const datedItemSchema = z.object({
  start: z.string().min(1),
  end: z.string().min(1),
  title: z.string().min(1),
  institution: z.string().optional(),
  location: z.string().default(""),
});

export const resumeSchema = z
  .object({
    id: z.string().min(1),
    fileName: z.string().min(1),
    profile: profileSchema,
    employment: z.array(employmentSchema),
    earlierExperience: z.array(employmentSchema).default([]),
    skills: z.array(z.string()),
    education: z.array(datedItemSchema),
    courses: z.array(datedItemSchema).default([]),
  })
  .strict();

export type Resume = z.infer<typeof resumeSchema>;
