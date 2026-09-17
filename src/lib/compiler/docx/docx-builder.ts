import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Packer,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";
import { ResumeBlockElement, LetterBlockElement } from "@/types/document-spec";
import { ProjectSpec } from "@/types/schemas/project-spec-schemas";

/**
 * Compiles a SlideCraft ProjectSpec (specifically Resumes or Letters) into a native Microsoft Word .docx document.
 */
export async function compileDocumentToDocx(spec: ProjectSpec): Promise<Document> {
  const children: (Paragraph | Table)[] = [];

  const title = spec.meta.title || "SlideCraft Document";

  // Document Title Header
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    })
  );

  // Iterate pages and elements
  for (const page of spec.pages) {
    for (const elem of page.elements) {
      if (elem.type === "resume_block") {
        const resBlock = elem as ResumeBlockElement;
        switch (resBlock.sectionType) {
          case "header":
            if (resBlock.contactInfo) {
              const ci = resBlock.contactInfo;
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: ci.name, bold: true, size: 32 }),
                    ...(ci.title ? [new TextRun({ text: `\n${ci.title}`, italics: true, size: 24 })] : []),
                    new TextRun({
                      text: `\n${[ci.email, ci.phone, ci.location, ci.linkedin, ci.github]
                        .filter(Boolean)
                        .join(" | ")}`,
                      size: 20,
                    }),
                  ],
                  spacing: { after: 240 },
                })
              );
            }
            break;

          case "summary":
            if (resBlock.summaryText) {
              children.push(
                new Paragraph({
                  text: "PROFESSIONAL SUMMARY",
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 200, after: 120 },
                }),
                new Paragraph({
                  text: resBlock.summaryText,
                  spacing: { after: 200 },
                })
              );
            }
            break;

          case "experience":
          case "projects":
          case "education":
          case "certifications":
          case "awards":
            const headingMap: Record<string, string> = {
              experience: "WORK EXPERIENCE",
              projects: "PROJECTS & INITIATIVES",
              education: "EDUCATION",
              certifications: "CERTIFICATIONS",
              awards: "HONORS & AWARDS",
            };
            children.push(
              new Paragraph({
                text: headingMap[resBlock.sectionType] || resBlock.sectionType.toUpperCase(),
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 240, after: 120 },
              })
            );

            for (const item of resBlock.items || []) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: item.title, bold: true }),
                    ...(item.subtitle ? [new TextRun({ text: ` - ${item.subtitle}`, italics: true })] : []),
                    ...(item.dateRange ? [new TextRun({ text: `  (${item.dateRange})` })] : []),
                  ],
                  spacing: { before: 80, after: 40 },
                })
              );

              for (const b of item.bullets) {
                children.push(
                  new Paragraph({
                    text: `• ${b}`,
                    spacing: { after: 40 },
                  })
                );
              }

              if (item.tags && item.tags.length > 0) {
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Technologies: ", bold: true }),
                      new TextRun({ text: item.tags.join(", ") }),
                    ],
                    spacing: { after: 80 },
                  })
                );
              }
            }
            break;

          case "skills":
            children.push(
              new Paragraph({
                text: "SKILLS & COMPETENCIES",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 120 },
              })
            );
            for (const item of resBlock.items || []) {
              if (item.tags && item.tags.length > 0) {
                children.push(
                  new Paragraph({
                    text: item.tags.join(" • "),
                    spacing: { after: 120 },
                  })
                );
              }
            }
            break;
        }
      } else if (elem.type === "letter_block") {
        const letBlock = elem as LetterBlockElement;
        switch (letBlock.sectionType) {
          case "sender_header":
            if (letBlock.sender) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: letBlock.sender.name, bold: true }),
                    ...(letBlock.sender.title ? [new TextRun({ text: `\n${letBlock.sender.title}` })] : []),
                    ...(letBlock.sender.organization ? [new TextRun({ text: `\n${letBlock.sender.organization}` })] : []),
                    ...(letBlock.sender.address ? [new TextRun({ text: `\n${letBlock.sender.address}` })] : []),
                    ...(letBlock.sender.email ? [new TextRun({ text: `\nEmail: ${letBlock.sender.email}` })] : []),
                  ],
                  spacing: { after: 200 },
                })
              );
            }
            break;

          case "date_line":
            if (letBlock.date) {
              children.push(
                new Paragraph({
                  text: letBlock.date,
                  spacing: { after: 200 },
                })
              );
            }
            break;

          case "recipient_header":
            if (letBlock.recipient) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: letBlock.recipient.name, bold: true }),
                    ...(letBlock.recipient.title ? [new TextRun({ text: `\n${letBlock.recipient.title}` })] : []),
                    ...(letBlock.recipient.organization ? [new TextRun({ text: `\n${letBlock.recipient.organization}` })] : []),
                    ...(letBlock.recipient.address ? [new TextRun({ text: `\n${letBlock.recipient.address}` })] : []),
                  ],
                  spacing: { after: 200 },
                })
              );
            }
            break;

          case "subject_line":
            if (letBlock.subject) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: "Subject: ", bold: true }),
                    new TextRun({ text: letBlock.subject, bold: true, underline: {} }),
                  ],
                  spacing: { after: 200 },
                })
              );
            }
            break;

          case "salutation":
            if (letBlock.salutation) {
              children.push(
                new Paragraph({
                  text: letBlock.salutation,
                  spacing: { after: 160 },
                })
              );
            }
            break;

          case "body_paragraph":
            if (letBlock.content) {
              children.push(
                new Paragraph({
                  text: letBlock.content,
                  spacing: { after: 160 },
                })
              );
            }
            break;

          case "complimentary_close":
            if (letBlock.closing) {
              children.push(
                new Paragraph({
                  text: letBlock.closing,
                  spacing: { before: 160, after: 300 },
                })
              );
            }
            break;

          case "signature_block":
            if (letBlock.signer) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: letBlock.signer.name, bold: true }),
                    ...(letBlock.signer.designation || letBlock.signer.title
                      ? [new TextRun({ text: `\n${letBlock.signer.designation || letBlock.signer.title}` })]
                      : []),
                    ...(letBlock.signer.organization
                      ? [new TextRun({ text: `\n${letBlock.signer.organization}` })]
                      : []),
                  ],
                  spacing: { after: 200 },
                })
              );
            }
            break;

          case "enclosures":
            if (letBlock.content) {
              children.push(
                new Paragraph({
                  children: [new TextRun({ text: letBlock.content, italics: true })],
                  spacing: { before: 200 },
                })
              );
            }
            break;
        }
      } else if (elem.type === "text") {
        children.push(
          new Paragraph({
            text: elem.content,
            spacing: { after: 120 },
          })
        );
      } else if (elem.type === "list") {
        for (const it of elem.items) {
          children.push(
            new Paragraph({
              text: `• ${it.text}`,
              spacing: { after: 60 },
            })
          );
        }
      }
    }
  }

  return new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });
}

/**
 * Compiles to browser Blob for client-side download.
 */
export async function compileDocumentToDocxBlob(spec: ProjectSpec): Promise<Blob> {
  const doc = await compileDocumentToDocx(spec);
  return await Packer.toBlob(doc);
}

/**
 * Compiles to Node.js Buffer for server-side API responses.
 */
export async function compileDocumentToDocxBuffer(spec: ProjectSpec): Promise<Buffer> {
  const doc = await compileDocumentToDocx(spec);
  return await Packer.toBuffer(doc);
}
