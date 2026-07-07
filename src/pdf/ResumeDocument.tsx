import React from "react";
import { resolve } from "node:path";
import {
  Document,
  Font,
  Link,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import type { Resume } from "../resume/schema.js";
import { buildSkillRows } from "./skills.js";

const fontPath = (fileName: string) =>
  resolve("node_modules", "@fontsource", "eb-garamond", "files", fileName);

Font.register({
  family: "EB Garamond",
  fonts: [
    {
      src: fontPath("eb-garamond-latin-400-normal.woff"),
      fontWeight: 400,
    },
    {
      src: fontPath("eb-garamond-latin-500-normal.woff"),
      fontWeight: 500,
    },
    {
      src: fontPath("eb-garamond-latin-700-normal.woff"),
      fontWeight: 700,
    },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

const PAGE_PADDING_HORIZONTAL = 45;
const DATE_COLUMN_WIDTH = 126.3;
const TEXT_COLOR = "#212121";
const NO_LIGATURE_JOINER = "\u200C";
const styles = StyleSheet.create({
  page: {
    paddingTop: 22,
    paddingBottom: 20,
    paddingHorizontal: PAGE_PADDING_HORIZONTAL,
    fontFamily: "EB Garamond",
    color: TEXT_COLOR,
    fontSize: 9,
    lineHeight: 1.15,
  },
  header: {
    alignItems: "center",
    marginBottom: 6.5,
  },
  name: {
    fontWeight: 700,
    fontSize: 12.4,
    marginBottom: 11,
  },
  contact: {
    fontWeight: 500,
    fontSize: 9,
  },
  contactLink: {
    color: TEXT_COLOR,
    textDecoration: "underline",
  },
  headerContacts: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 4,
  },
  contactSeparator: {
    fontWeight: 500,
    fontSize: 9,
  },
  section: {
    borderTopWidth: 0.5,
    borderTopColor: TEXT_COLOR,
    paddingTop: 4.4,
    marginTop: 11,
  },
  firstSection: {
    marginTop: 10.5,
  },
  compactSection: {
    marginTop: 9.2,
  },
  coursesSection: {
    marginTop: 14.4,
  },
  sectionHeader: {
    width: DATE_COLUMN_WIDTH,
    fontWeight: 500,
    fontSize: 8.5,
  },
  blockSectionHeader: {
    fontWeight: 500,
    fontSize: 8.5,
  },
  summaryText: {
    fontSize: 9.2,
    lineHeight: 1.18,
  },
  skillsGrid: {
    gap: 1.8,
  },
  skillRow: {
    flexDirection: "row",
  },
  skillLabel: {
    fontWeight: 700,
    width: 82,
  },
  skillValue: {
    flex: 1,
  },
  sectionBody: {
    flex: 1,
  },
  sectionIntroRow: {
    flexDirection: "row",
  },
  linksText: {
    fontSize: 9,
    color: TEXT_COLOR,
    textDecoration: "underline",
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkIcon: {
    width: 7.8,
    height: 7.8,
    marginRight: 4.2,
  },
  row: {
    flexDirection: "row",
    marginTop: 8,
  },
  employmentRowLater: {
    marginTop: 8.6,
  },
  employmentRowAfterLongRole: {
    marginTop: 9,
  },
  courseRowLater: {
    marginTop: 11,
  },
  dateColumn: {
    width: DATE_COLUMN_WIDTH,
    paddingRight: 16,
    fontSize: 9,
  },
  contentColumn: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 4.6,
  },
  itemTitle: {
    flex: 1,
    fontWeight: 500,
    fontSize: 10.9,
    lineHeight: 1.1,
  },
  datedItemTitle: {
    flex: 1,
    fontWeight: 500,
    fontSize: 10.9,
    lineHeight: 1.25,
  },
  itemLocation: {
    fontSize: 9,
    textAlign: "right",
    width: 112,
  },
  datedItemLocation: {
    fontSize: 9,
    textAlign: "right",
    width: 78,
  },
  paragraph: {
    marginBottom: 4.2,
  },
  bulletRow: {
    flexDirection: "row",
    marginLeft: 4.6,
    marginBottom: 0.25,
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
});

type SectionProps = {
  title: string;
  children: React.ReactNode;
  wrap?: boolean;
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
        <ExperienceSection title="Work Experience" items={resume.employment} />
        <ExperienceSection
          title="Earlier Experience"
          items={resume.earlierExperience}
        />
        <DatedItemsSection title="Education" items={resume.education} />
      </Page>
    </Document>
  );
}

function buildKeywords(resume: Resume) {
  const values = resume.skills.map((entry) =>
    entry.includes(":") ? entry.slice(entry.indexOf(":") + 1).trim() : entry,
  );
  return values.join(", ");
}

function Header({ resume }: { resume: Resume }) {
  return (
    <View style={styles.header}>
      <Text style={styles.name}>
        {resume.profile.name}, {resume.profile.headline}
      </Text>
      <Text style={styles.contact}>{resume.profile.location}</Text>
      <View style={styles.headerContacts}>
        <View style={styles.linkItem}>
          <LinkIcon label="phone" url="" />
          <Link src={phoneHref(resume.profile.phone)} style={styles.linksText}>
            {resume.profile.phone}
          </Link>
        </View>
        <Text style={styles.contactSeparator}>·</Text>
        <View style={styles.linkItem}>
          <LinkIcon label="email" url="" />
          <Link
            src={`mailto:${resume.profile.email}`}
            style={styles.linksText}
          >
            {resume.profile.email}
          </Link>
        </View>
        {resume.profile.links.map((link) => (
          <React.Fragment key={link.label}>
            <Text style={styles.contactSeparator}>·</Text>
            <View style={styles.linkItem}>
              <LinkIcon label={link.label} url={link.url} />
              <Link src={externalHref(link.url)} style={styles.linksText}>
                {formatLinkText(link)}
              </Link>
            </View>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

function Section({ title, children, wrap = true }: SectionProps) {
  const sectionStyle =
    title === "Summary"
      ? { ...styles.section, ...styles.firstSection }
      : styles.section;

  return (
    <View style={sectionStyle} wrap={wrap}>
      <View style={styles.sectionIntroRow}>
        <Text style={styles.sectionHeader}>{title}</Text>
        <View style={styles.sectionBody}>{children}</View>
      </View>
    </View>
  );
}

function BlockSection({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.blockSectionHeader}>{title}</Text>
      {children}
    </View>
  );
}

function CompactBlockSection({
  title,
  children,
  courses,
}: SectionProps & { courses?: boolean }) {
  return (
    <View
      style={{
        ...styles.section,
        ...styles.compactSection,
        ...(courses ? styles.coursesSection : {}),
      }}
    >
      <Text style={styles.blockSectionHeader}>{title}</Text>
      {children}
    </View>
  );
}

function SummarySection({ resume }: { resume: Resume }) {
  if (!resume.summary) {
    return null;
  }

  return (
    <Section title="Summary">
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
    <Section title="Technical Skills">
      <View style={styles.skillsGrid}>
        {rows.map((row) => (
          <View key={`${row.label}-${row.value}`} style={styles.skillRow}>
            {row.label ? (
              <Text style={styles.skillLabel}>{row.label}:</Text>
            ) : null}
            <Text style={styles.skillValue}>{renderPdfText(row.value)}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

function LinkIcon({ label, url }: { label: string; url: string }) {
  const normalized = `${label} ${url}`.toLowerCase();
  let viewBox = "0 0 24 24";
  let topOffset = 2.5;
  let icon: React.ReactElement;

  if (normalized.includes("phone")) {
    // Bootstrap Icons "telephone-fill" (MIT)
    viewBox = "0 0 16 16";
    icon = (
      <Path
        fill={TEXT_COLOR}
        d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"
      />
    );
  } else if (normalized.includes("email")) {
    // Bootstrap Icons "envelope-fill" (MIT); glyph sits high in its
    // viewBox, so it needs a larger downward nudge than the others
    viewBox = "0 0 16 16";
    topOffset = 2.6;
    icon = (
      <Path
        fill={TEXT_COLOR}
        d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z"
      />
    );
  } else if (normalized.includes("github")) {
    icon = (
      <Path
        fill={TEXT_COLOR}
        d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.4 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z"
      />
    );
  } else {
    icon = (
      <Path
        fill={TEXT_COLOR}
        d="M20.4 20.4h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.3V8.9h3.4v1.6h.1c.5-.9 1.6-1.8 3.3-1.8 3.6 0 4.2 2.3 4.2 5.4v6.3ZM5.3 7.3a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2Zm1.8 13.1H3.5V8.9h3.6v11.5ZM22.2 0H1.8C.8 0 0 .8 0 1.8v20.4C0 23.2.8 24 1.8 24h20.4c1 0 1.8-.8 1.8-1.8V1.8c0-1-.8-1.8-1.8-1.8Z"
      />
    );
  }

  return (
    <Svg style={{ ...styles.linkIcon, marginTop: topOffset }} viewBox={viewBox}>
      {icon}
    </Svg>
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
    <BlockSection title={title}>
      {items.map((job, index) => (
        <View
          key={`${job.start}-${job.company}-${job.title}`}
          style={employmentRowStyle(index)}
        >
          <Text style={styles.dateColumn}>
            {job.start} — {job.end}
          </Text>
          <View style={styles.contentColumn}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>
                {job.title}, {job.company}
              </Text>
              <Text style={styles.itemLocation}>{job.location}</Text>
            </View>
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
        </View>
      ))}
    </BlockSection>
  );
}

function employmentRowStyle(index: number) {
  if (index === 0) {
    return styles.row;
  }

  if (index === 3) {
    return { ...styles.row, ...styles.employmentRowAfterLongRole };
  }

  return { ...styles.row, ...styles.employmentRowLater };
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
    <CompactBlockSection title={title} courses={title === "Courses"}>
      {items.map((item, index) => (
        <View
          key={`${item.start}-${item.title}`}
          style={
            title === "Courses" && index > 0
              ? { ...styles.row, ...styles.courseRowLater }
              : styles.row
          }
        >
          <Text style={styles.dateColumn}>
            {item.start} — {item.end}
          </Text>
          <View style={styles.contentColumn}>
            <View style={styles.itemHeader}>
              <Text style={styles.datedItemTitle}>
                {formatDatedItemTitle(title, item)}
              </Text>
              {item.location ? (
                <Text style={styles.datedItemLocation}>{item.location}</Text>
              ) : null}
            </View>
          </View>
        </View>
      ))}
    </CompactBlockSection>
  );
}

function formatDatedItemTitle(
  sectionTitle: string,
  item: Resume["education"][number],
) {
  if (!item.institution) {
    return item.title;
  }

  if (sectionTitle === "Education") {
    return `${item.title}\n${item.institution}`;
  }

  return `${item.title}, ${item.institution}`;
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
