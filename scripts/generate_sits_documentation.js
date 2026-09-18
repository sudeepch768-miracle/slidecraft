const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Footer,
  Paragraph,
  TextRun,
  PageNumber,
  NumberFormat,
  AlignmentType
} = require("docx");

const { createTitlePage } = require("./doc_content/title_page");
const { createPreliminaryPages } = require("./doc_content/preliminary");
const { createChapter1 } = require("./doc_content/chapter1");
const { createChapter2 } = require("./doc_content/chapter2");
const { createChapter3 } = require("./doc_content/chapter3");
const { createChapter4 } = require("./doc_content/chapter4");
const { createChapter5 } = require("./doc_content/chapter5");
const { createReferences } = require("./doc_content/references");

const FONT_FAMILY = "Times New Roman";

// SITS Margin Specifications:
// Left/Binding: 3.75 cm = 1.5 in = 2160 dxa
// Top: 2.5 cm = 1.0 in = 1440 dxa
// Right: 2.5 cm = 1.0 in = 1440 dxa
// Bottom: 2.5 cm = 1.0 in = 1440 dxa
const PAGE_MARGINS = {
  top: 1440,
  bottom: 1440,
  left: 2160,
  right: 1440,
};

// SITS Page Size: A4 (210 mm x 297 mm)
const PAGE_SIZE = {
  width: 11906,
  height: 16838,
};

async function generateDocumentation() {
  console.log("Compiling SITS Academic Project Documentation for SlideCraft AI...");

  // Section 1: Title Page (No header/footer, no visible page number)
  const titleSection = {
    properties: {
      page: {
        size: PAGE_SIZE,
        margin: PAGE_MARGINS,
      },
    },
    children: createTitlePage(),
  };

  // Section 2: Preliminary Pages (Certificate, Ack, TOC, Lists, Abstract)
  // Lowercase Roman numerals centered at bottom, starting at ii
  const preliminarySection = {
    properties: {
      page: {
        size: PAGE_SIZE,
        margin: PAGE_MARGINS,
        pageNumbers: {
          start: 2,
          formatType: NumberFormat.LOWER_ROMAN,
        },
      },
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 0 },
            children: [
              new TextRun({
                children: [PageNumber.CURRENT],
                font: FONT_FAMILY,
                size: 24, // 12pt
              }),
            ],
          }),
        ],
      }),
    },
    children: createPreliminaryPages(),
  };

  // Section 3: Main Body (Chapters 1 to 5 + References)
  // Arabic numerals centered at bottom, starting at 1
  const mainChildren = [
    ...createChapter1(),
    ...createChapter2(),
    ...createChapter3(),
    ...createChapter4(),
    ...createChapter5(),
    ...createReferences(),
  ];

  const mainSection = {
    properties: {
      page: {
        size: PAGE_SIZE,
        margin: PAGE_MARGINS,
        pageNumbers: {
          start: 1,
          formatType: NumberFormat.DECIMAL,
        },
      },
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 0 },
            children: [
              new TextRun({
                children: [PageNumber.CURRENT],
                font: FONT_FAMILY,
                size: 24, // 12pt
              }),
            ],
          }),
        ],
      }),
    },
    children: mainChildren,
  };

  const doc = new Document({
    sections: [titleSection, preliminarySection, mainSection],
  });

  console.log("Generating binary OpenXML DOCX buffer...");
  const buffer = await Packer.toBuffer(doc);

  // Write to project workspace root
  const outputPath = path.join(__dirname, "..", "SlideCraft_AI_Project_Documentation.docx");
  fs.writeFileSync(outputPath, buffer);
  console.log(`Document written to: ${outputPath} (${buffer.length} bytes)`);

  // Also copy to artifact directory if it exists
  const artifactDir = "C:\\Users\\sudeep\\.gemini\\antigravity\\brain\\49d0c866-787a-4c39-9fb3-7e4b813da05c";
  if (fs.existsSync(artifactDir)) {
    const artifactPath = path.join(artifactDir, "SlideCraft_AI_Project_Documentation.docx");
    fs.writeFileSync(artifactPath, buffer);
    console.log(`Copy written to artifact directory: ${artifactPath}`);
  }

  console.log("Generation complete!");
}

generateDocumentation().catch((err) => {
  console.error("Documentation generation failed:", err);
  process.exit(1);
});
