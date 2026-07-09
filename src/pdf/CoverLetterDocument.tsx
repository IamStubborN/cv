import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Resume } from "../resume/schema.js";
import { Header } from "./ResumeDocument.js";

const styles = StyleSheet.create({
  page: {
    paddingTop: 22,
    paddingBottom: 28,
    paddingHorizontal: 45,
    fontFamily: "Public Sans",
    color: "#212121",
    fontSize: 10,
    lineHeight: 1.45,
  },
  body: {
    marginTop: 26,
  },
  greeting: {
    marginBottom: 10,
  },
  paragraph: {
    marginBottom: 9,
    textAlign: "justify",
  },
  closing: {
    marginTop: 14,
  },
  signature: {
    marginTop: 2,
    fontWeight: 600,
  },
});

export function CoverLetterDocument({ resume }: { resume: Resume }) {
  const letter = resume.coverLetter;
  if (!letter) {
    throw new Error(`Resume "${resume.id}" has no coverLetter section.`);
  }

  return (
    <Document
      title={`${resume.profile.name} — Cover Letter`}
      author={resume.profile.name}
      subject={`Cover Letter — ${resume.profile.headline}`}
    >
      <Page size="A4" style={styles.page}>
        <Header resume={resume} />
        <View style={styles.body}>
          <Text style={styles.greeting}>{letter.greeting}</Text>
          {letter.paragraphs.map((paragraph) => (
            <Text key={paragraph} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
          <Text style={styles.closing}>{letter.closing}</Text>
          <Text style={styles.signature}>{resume.profile.name}</Text>
        </View>
      </Page>
    </Document>
  );
}
