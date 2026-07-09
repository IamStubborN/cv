import React from "react";
import { resolve } from "node:path";
import {
  Document,
  Font,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { Resume } from "../resume/schema.js";
import { buildSkillRows } from "./skills.js";

const fontPath = (fileName: string) =>
  resolve("node_modules", "@fontsource", "public-sans", "files", fileName);

Font.register({
  family: "Public Sans",
  fonts: [
    {
      src: fontPath("public-sans-latin-ext-400-normal.woff"),
      fontWeight: 400,
    },
    {
      src: fontPath("public-sans-latin-ext-500-normal.woff"),
      fontWeight: 500,
    },
    {
      src: fontPath("public-sans-latin-ext-600-normal.woff"),
      fontWeight: 600,
    },
    {
      src: fontPath("public-sans-latin-ext-700-normal.woff"),
      fontWeight: 700,
    },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

const PAGE_PADDING_HORIZONTAL = 45;
const TEXT_COLOR = "#212121";
const NO_LIGATURE_JOINER = "\u200C";

const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: PAGE_PADDING_HORIZONTAL,
    fontFamily: "Public Sans",
    color: TEXT_COLOR,
    fontSize: 8,
    lineHeight: 1.16,
  },
  header: {
    alignItems: "center",
    marginBottom: 6.5,
  },
  name: {
    fontWeight: 700,
    fontSize: 12,
    marginBottom: 9.5,
  },
  contact: {
    fontWeight: 600,
    fontSize: 8.2,
  },
  contactLink: {
    color: TEXT_COLOR,
    textDecoration: "underline",
  },
  headerContacts: {
    fontWeight: 600,
    fontSize: 8.2,
    textAlign: "center",
    marginTop: 4,
  },
  section: {
    borderTopWidth: 0.5,
    borderTopColor: TEXT_COLOR,
    paddingTop: 6.2,
    marginTop: 10.2,
  },
  firstSection: {
    marginTop: 9,
  },
  compactSection: {
    marginTop: 8.2,
  },
  coursesSection: {
    marginTop: 14.4,
  },
  sectionTitle: {
    fontWeight: 600,
    fontSize: 8.1,
    marginBottom: 4.2,
  },
  summaryText: {
    fontSize: 8.3,
    lineHeight: 1.22,
  },
  skillsGrid: {
    gap: 2.1,
  },
  skillLine: {
    fontSize: 8,
    lineHeight: 1.2,
  },
  skillLabel: {
    fontWeight: 700,
  },
  entryFirst: {
    marginTop: 3.8,
  },
  entryLater: {
    marginTop: 12.2,
  },
  entryAfterLongRole: {
    marginTop: 13,
  },
  itemTitle: {
    fontWeight: 600,
    fontSize: 9.7,
    lineHeight: 1.1,
    marginBottom: 1.5,
  },
  dateLine: {
    fontWeight: 600,
    fontSize: 8.1,
    marginBottom: 4.2,
  },
  institution: {
    fontSize: 8.3,
    marginBottom: 2.4,
  },
  paragraph: {
    marginBottom: 3.6,
  },
  bulletRow: {
    flexDirection: "row",
    marginLeft: 4.6,
    marginBottom: 0.65,
    paddingRight: 2,
  },
  bullet: {
    width: 17.4,
    textAlign: "center",
  },
  bulletText: {
    flex: 1,
  },
  technologies: {
    marginTop: 3,
  },
  linksText: {
    color: TEXT_COLOR,
    textDecoration: "underline",
  },
});

type SectionProps = {
  title: string;
  children: React.ReactNode;
  first?: boolean;
  compact?: boolean;
  courses?: boolean;
};

export function ResumeDocument({ resume }: { resume: Resume }) {
  return (
    <Document
      title={`${resume.profile.name}, ${resume.profile.headline}`}
      author={resume.profile.name}
      subject={resume.profile.headline}
      keywords={buildKeywords(resume)}
    >
      <Page size="A4" style={styles.page}>
        <Header resume={resume} />
        <SummarySection resume={resume} />
        <SkillsSection resume={resume} />
        <ExperienceSection title="Experience" items={resume.employment} />
        <ExperienceSection
          title="Earlier Experience"
          items={resume.earlierExperience}
        />
        <DatedItemsSection title="Education" items={resume.education} />
        <DatedItemsSection title="Courses" items={resume.courses} />
      </Page>
    </Document>
  );
}

function buildKeywords(resume: Resume) {
  const skillValues = resume.skills.map((entry) =>
    entry.includes(":") ? entry.slice(entry.indexOf(":") + 1).trim() : entry,
  );
  const jobTechnologies = [
    ...resume.employment,
    ...resume.earlierExperience,
  ].flatMap((job) => job.technologies);

  return [...new Set([...skillValues, ...jobTechnologies])].join(", ");
}

export function Header({ resume }: { resume: Resume }) {
  return (
    <View style={styles.header}>
      <Text style={styles.name}>
        {resume.profile.name}, {resume.profile.headline}
      </Text>
      <Text style={styles.contact}>{resume.profile.location}</Text>
      <Text style={styles.headerContacts}>
        <Link src={phoneHref(resume.profile.phone)} style={styles.linksText}>
          {resume.profile.phone}
        </Link>
        <Text> · </Text>
        <Link
          src={`mailto:${resume.profile.email}`}
          style={styles.linksText}
        >
          {resume.profile.email}
        </Link>
        {resume.profile.links.map((link) => (
          <React.Fragment key={link.label}>
            <Text> · </Text>
            <Link src={externalHref(link.url)} style={styles.linksText}>
              {formatLinkText(link)}
            </Link>
          </React.Fragment>
        ))}
      </Text>
    </View>
  );
}

function Section({
  title,
  children,
  first = false,
  compact = false,
  courses = false,
}: SectionProps) {
  return (
    <View
      style={{
        ...styles.section,
        ...(first ? styles.firstSection : {}),
        ...(compact ? styles.compactSection : {}),
        ...(courses ? styles.coursesSection : {}),
      }}
    >
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function SummarySection({ resume }: { resume: Resume }) {
  if (!resume.summary) {
    return null;
  }

  return (
    <Section title="Summary" first>
      <Text style={styles.summaryText}>{renderPdfText(resume.summary)}</Text>
    </Section>
  );
}

function SkillsSection({ resume }: { resume: Resume }) {
  const rows = buildSkillRows(resume.skills);

  if (rows.length === 0) {
    return null;
  }

  return (
    <Section title="Skills">
      <View style={styles.skillsGrid}>
        {rows.map((row) => (
          <Text key={`${row.label}-${row.value}`} style={styles.skillLine}>
            {row.label ? (
              <Text style={styles.skillLabel}>{row.label}: </Text>
            ) : null}
            <Text>{renderPdfText(row.value)}</Text>
          </Text>
        ))}
      </View>
    </Section>
  );
}

function ExperienceSection({
  title,
  items,
}: {
  title: string;
  items: Resume["employment"];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Section title={title}>
      {items.map((job, index) => (
        <View
          key={`${job.start}-${job.company}-${job.title}`}
          style={employmentEntryStyle(index)}
        >
          <Text style={styles.itemTitle}>
            {job.title}, {job.company}
          </Text>
          <Text style={styles.dateLine}>
            {formatDateRange(job.start, job.end)} · {job.location}
          </Text>
          {job.summary ? (
            <Text style={styles.paragraph}>{renderPdfText(job.summary)}</Text>
          ) : null}
          {job.highlights.map((highlight) => (
            <View key={highlight} style={styles.bulletRow} wrap={false}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{renderPdfText(highlight)}</Text>
            </View>
          ))}
          {job.technologies.length > 0 ? (
            <Text style={styles.technologies}>
              Technologies: {renderPdfText(job.technologies.join(", "))}
            </Text>
          ) : null}
        </View>
      ))}
    </Section>
  );
}

function employmentEntryStyle(index: number) {
  if (index === 0) {
    return styles.entryFirst;
  }

  if (index === 3) {
    return { ...styles.entryLater, ...styles.entryAfterLongRole };
  }

  return styles.entryLater;
}

function DatedItemsSection({
  title,
  items,
}: {
  title: string;
  items: Resume["education"];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Section title={title} compact courses={title === "Courses"}>
      {items.map((item, index) => (
        <View
          key={`${item.start}-${item.title}`}
          style={index === 0 ? styles.entryFirst : styles.entryLater}
        >
          <Text style={styles.itemTitle}>{item.title}</Text>
          {item.institution ? (
            <Text style={styles.institution}>{item.institution}</Text>
          ) : null}
          <Text style={styles.dateLine}>
            {formatDateRange(item.start, item.end)}
            {item.location ? ` | ${item.location}` : ""}
          </Text>
        </View>
      ))}
    </Section>
  );
}

function formatDateRange(start: string, end: string): string {
  return `${start} - ${end}`;
}

function renderPdfText(value: string) {
  return value.replace(/fi/g, `f${NO_LIGATURE_JOINER}i`);
}

function externalHref(url: string) {
  if (/^(https?:|mailto:|tel:)/i.test(url)) {
    return url;
  }

  return `https://${url}`;
}

function formatLinkText(link: Resume["profile"]["links"][number]) {
  return link.url.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/i, "");
}

function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
