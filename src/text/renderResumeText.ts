import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { buildSkillRows } from "../pdf/skills.js";
import type { Resume } from "../resume/schema.js";

export function atsOutputPath(pdfFileName: string): string {
  return pdfFileName.replace(/\.pdf$/i, "_ATS.txt");
}

export function renderResumeText(resume: Resume): string {
  const lines: string[] = [];
  const { profile } = resume;

  lines.push(profile.name.toUpperCase());
  lines.push(profile.headline);
  lines.push(
    [profile.location, profile.phone, profile.email].join(" | "),
  );
  if (profile.links.length > 0) {
    lines.push(
      profile.links
        .map((link) => link.url.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/i, ""))
        .join(" | "),
    );
  }
  lines.push("");

  if (resume.summary) {
    lines.push("SUMMARY");
    lines.push(resume.summary);
    lines.push("");
  }

  if (resume.skills.length > 0) {
    lines.push("SKILLS");
    for (const row of buildSkillRows(resume.skills)) {
      lines.push(row.label ? `${row.label}: ${row.value}` : row.value);
    }
    lines.push("");
  }

  appendExperienceSection(lines, "EXPERIENCE", resume.employment);
  appendExperienceSection(lines, "EARLIER EXPERIENCE", resume.earlierExperience);
  appendDatedSection(lines, "EDUCATION", resume.education);
  appendDatedSection(lines, "COURSES", resume.courses);

  return `${lines.join("\n").trimEnd()}\n`;
}

export async function renderResumeTextFile(
  resume: Resume,
  outputPath: string,
): Promise<void> {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, renderResumeText(resume), "utf8");
}

function appendExperienceSection(
  lines: string[],
  title: string,
  items: Resume["employment"],
) {
  if (items.length === 0) {
    return;
  }

  lines.push(title);
  lines.push("");

  for (const job of items) {
    lines.push(
      `${job.title}, ${job.company} | ${formatDateRange(job.start, job.end)} | ${job.location}`,
    );
    if (job.summary) {
      lines.push(job.summary);
    }
    for (const highlight of job.highlights) {
      lines.push(`- ${highlight}`);
    }
    if (job.technologies.length > 0) {
      lines.push(`Technologies: ${job.technologies.join(", ")}`);
    }
    lines.push("");
  }
}

function appendDatedSection(
  lines: string[],
  title: string,
  items: Resume["education"],
) {
  if (items.length === 0) {
    return;
  }

  lines.push(title);
  lines.push("");

  for (const item of items) {
    const headline = item.institution
      ? `${item.title}, ${item.institution}`
      : item.title;
    const location = item.location ? ` | ${item.location}` : "";
    lines.push(`${headline} | ${formatDateRange(item.start, item.end)}${location}`);
  }

  lines.push("");
}

function formatDateRange(start: string, end: string): string {
  return `${start} - ${end}`;
}