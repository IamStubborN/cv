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
    paddingTop: 28,
    paddingBottom: 28,
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
    marginBottom: 15.5,
  },
  contact: {
    fontWeight: 500,
    fontSize: 9,
  },
  contactLink: {
    color: TEXT_COLOR,
    textDecoration: "underline",
  },
  core: {
    fontSize: 8.7,
    marginTop: 5.2,
  },
  section: {
    borderTopWidth: 0.5,
    borderTopColor: TEXT_COLOR,
    paddingTop: 4.4,
    marginTop: 15,
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
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  blockSectionHeader: {
    fontWeight: 500,
    fontSize: 8.5,
    letterSpacing: 1,
    textTransform: "uppercase",
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
  linksInline: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
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
    marginTop: 12.2,
  },
  employmentRowAfterLongRole: {
    marginTop: 13.8,
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
    marginBottom: 7.2,
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
    marginBottom: 5,
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
    marginTop: 3.8,
  },
});

type SectionProps = {
  title: string;
  children: React.ReactNode;
  wrap?: boolean;
};

export function ResumeDocument({ resume }: { resume: Resume }) {
  return (
    <Document title={`${resume.profile.name}, ${resume.profile.headline}`}>
      <Page size="A4" style={styles.page}>
        <Header resume={resume} />
        <LinksSection resume={resume} />
        <ExperienceSection title="Employment History" items={resume.employment} />
        <ExperienceSection
          title="Earlier Experience"
          items={resume.earlierExperience}
        />
        <DatedItemsSection title="Education" items={resume.education} />
      </Page>
    </Document>
  );
}

function Header({ resume }: { resume: Resume }) {
  return (
    <View style={styles.header}>
      <Text style={styles.name}>
        {resume.profile.name}, {resume.profile.headline}
      </Text>
      <Text style={styles.contact}>
        {resume.profile.location}, {/* */}
        <Link src={phoneHref(resume.profile.phone)} style={styles.contactLink}>
          {resume.profile.phone}
        </Link>
        , {/* */}
        <Link src={`mailto:${resume.profile.email}`} style={styles.contactLink}>
          {resume.profile.email}
        </Link>
      </Text>
      {resume.skills.length > 0 ? (
        <Text style={styles.core}>Skills: {resume.skills.join(", ")}</Text>
      ) : null}
    </View>
  );
}

function Section({ title, children, wrap = true }: SectionProps) {
  const sectionStyle =
    title === "Links"
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

function LinksSection({ resume }: { resume: Resume }) {
  return (
    <Section title="Links">
      <View style={styles.linksInline}>
        {resume.profile.links.map((link) => (
          <View key={link.label} style={styles.linkItem}>
            <LinkIcon label={link.label} url={link.url} />
            <Link src={externalHref(link.url)} style={styles.linksText}>
              {link.label}
            </Link>
          </View>
        ))}
      </View>
    </Section>
  );
}

function LinkIcon({ label, url }: { label: string; url: string }) {
  const normalized = `${label} ${url}`.toLowerCase();
  const icon =
    normalized.includes("github") ? (
      <Path
        fill={TEXT_COLOR}
        d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.4 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z"
      />
    ) : (
      <Path
        fill={TEXT_COLOR}
        d="M20.4 20.4h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.3V8.9h3.4v1.6h.1c.5-.9 1.6-1.8 3.3-1.8 3.6 0 4.2 2.3 4.2 5.4v6.3ZM5.3 7.3a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2Zm1.8 13.1H3.5V8.9h3.6v11.5ZM22.2 0H1.8C.8 0 0 .8 0 1.8v20.4C0 23.2.8 24 1.8 24h20.4c1 0 1.8-.8 1.8-1.8V1.8c0-1-.8-1.8-1.8-1.8Z"
      />
    );

  return (
    <Svg style={styles.linkIcon} viewBox="0 0 24 24">
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
    const [firstWord, ...rest] = item.institution.split(" ");
    return `${item.title}, ${firstWord}\n${rest.join(" ")}`;
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

function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
