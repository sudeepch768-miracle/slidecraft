const {
  Paragraph,
  TextRun,
  AlignmentType,
  PageBreak
} = require("docx");

const FONT_FAMILY = "Times New Roman";

function createTitlePage() {
  const elements = [];

  // Top Spacing
  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 80, line: 280, lineRule: "auto" },
    children: [
      new TextRun({
        text: "SIDDHARTHA INSTITUTE OF TECHNOLOGY & SCIENCES",
        font: FONT_FAMILY,
        size: 28, // 14pt
        bold: true,
        color: "000000",
      }),
    ],
  }));

  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60, line: 260, lineRule: "auto" },
    children: [
      new TextRun({
        text: "(UGC-AUTONOMOUS)",
        font: FONT_FAMILY,
        size: 24, // 12pt
        bold: true,
        color: "000000",
      }),
    ],
  }));

  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60, line: 240, lineRule: "auto" },
    children: [
      new TextRun({
        text: "Approved by AICTE, New Delhi & Affiliated to JNTUH, Hyderabad",
        font: FONT_FAMILY,
        size: 21,
        color: "333333",
      }),
    ],
  }));

  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60, line: 240, lineRule: "auto" },
    children: [
      new TextRun({
        text: "Accredited by NBA and NAAC with 'A+' Grade",
        font: FONT_FAMILY,
        size: 21,
        bold: true,
        color: "333333",
      }),
    ],
  }));

  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200, line: 240, lineRule: "auto" },
    children: [
      new TextRun({
        text: "Narapally, Korremula Road, Ghatkesar, Medchal-Malkajgiri District – 500 088",
        font: FONT_FAMILY,
        size: 20,
        color: "444444",
      }),
    ],
  }));

  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 240, line: 280, lineRule: "auto" },
    children: [
      new TextRun({
        text: "DEPARTMENT OF [DEPARTMENT NAME]",
        font: FONT_FAMILY,
        size: 26, // 13pt
        bold: true,
        color: "000000",
      }),
    ],
  }));

  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 180, after: 80, line: 280, lineRule: "auto" },
    children: [
      new TextRun({
        text: "PROJECT REPORT",
        font: FONT_FAMILY,
        size: 26,
        bold: true,
        color: "000000",
      }),
    ],
  }));

  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 140, line: 240, lineRule: "auto" },
    children: [
      new TextRun({
        text: "ON",
        font: FONT_FAMILY,
        size: 22,
        bold: true,
        color: "000000",
      }),
    ],
  }));

  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 200, line: 320, lineRule: "auto" },
    children: [
      new TextRun({
        text: "\"SLIDECRAFT AI — AN AI-POWERED MULTI-FORMAT CREATIVE DESIGN AND PRESENTATION GENERATION PLATFORM\"",
        font: FONT_FAMILY,
        size: 26, // 13pt
        bold: true,
        color: "0F172A",
      }),
    ],
  }));

  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 140, after: 60, line: 260, lineRule: "auto" },
    children: [
      new TextRun({
        text: "Submitted in partial fulfillment of the requirements for the award of the degree of",
        font: FONT_FAMILY,
        size: 22,
        italics: true,
        color: "000000",
      }),
    ],
  }));

  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 40, line: 280, lineRule: "auto" },
    children: [
      new TextRun({
        text: "BACHELOR OF TECHNOLOGY",
        font: FONT_FAMILY,
        size: 26,
        bold: true,
        color: "000000",
      }),
    ],
  }));

  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 240, line: 260, lineRule: "auto" },
    children: [
      new TextRun({
        text: "IN [DEPARTMENT NAME]",
        font: FONT_FAMILY,
        size: 24,
        bold: true,
        color: "000000",
      }),
    ],
  }));

  // Student & Guide Section
  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 180, after: 60, line: 260, lineRule: "auto" },
    children: [
      new TextRun({
        text: "Submitted by",
        font: FONT_FAMILY,
        size: 22,
        italics: true,
        color: "000000",
      }),
    ],
  }));

  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 40, after: 200, line: 280, lineRule: "auto" },
    children: [
      new TextRun({
        text: "[STUDENT NAME]\n([ROLL NUMBER])",
        font: FONT_FAMILY,
        size: 24,
        bold: true,
        color: "000000",
      }),
    ],
  }));

  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 60, line: 260, lineRule: "auto" },
    children: [
      new TextRun({
        text: "Under the guidance of",
        font: FONT_FAMILY,
        size: 22,
        italics: true,
        color: "000000",
      }),
    ],
  }));

  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 40, after: 240, line: 280, lineRule: "auto" },
    children: [
      new TextRun({
        text: "[GUIDE NAME]\n[DESIGNATION]",
        font: FONT_FAMILY,
        size: 24,
        bold: true,
        color: "000000",
      }),
    ],
  }));

  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 0, line: 280, lineRule: "auto" },
    children: [
      new TextRun({
        text: "ACADEMIC YEAR: [ACADEMIC YEAR]",
        font: FONT_FAMILY,
        size: 24,
        bold: true,
        color: "000000",
      }),
    ],
  }));

  return elements;
}

module.exports = { createTitlePage };
