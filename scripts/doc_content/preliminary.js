const {
  Paragraph,
  TextRun,
  AlignmentType,
  PageBreak,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle
} = require("docx");
const { p, FONT_FAMILY } = require("./helpers");

function createPreliminaryPages() {
  const elements = [];

  // ==========================================
  // 1. CERTIFICATE PAGE (Page ii)
  // ==========================================
  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 80, line: 280, lineRule: "auto" },
    children: [
      new TextRun({
        text: "SIDDHARTHA INSTITUTE OF TECHNOLOGY & SCIENCES",
        font: FONT_FAMILY,
        size: 26,
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
        text: "(UGC-AUTONOMOUS)",
        font: FONT_FAMILY,
        size: 22,
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
        size: 20,
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
        size: 20,
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
        size: 19,
        color: "444444",
      }),
    ],
  }));

  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 240, line: 280, lineRule: "auto" },
    children: [
      new TextRun({
        text: "DEPARTMENT OF [DEPARTMENT NAME]",
        font: FONT_FAMILY,
        size: 24,
        bold: true,
        color: "000000",
      }),
    ],
  }));

  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 260, line: 280, lineRule: "auto" },
    children: [
      new TextRun({
        text: "CERTIFICATE",
        font: FONT_FAMILY,
        size: 28, // 14pt
        bold: true,
        color: "000000",
      }),
    ],
  }));

  elements.push(p(
    "This is to certify that the project report entitled \"SLIDECRAFT AI — AN AI-POWERED MULTI-FORMAT CREATIVE DESIGN AND PRESENTATION GENERATION PLATFORM\" is a bonafide record of technical project work carried out by [STUDENT NAME] (Roll No: [ROLL NUMBER]), in partial fulfillment of the requirements for the award of the degree of Bachelor of Technology in [DEPARTMENT NAME] from Siddhartha Institute of Technology & Sciences (UGC-Autonomous), affiliated to Jawaharlal Nehru Technological University Hyderabad (JNTUH), during the academic year [ACADEMIC YEAR]."
  ));

  elements.push(p(
    "The results embodied in this report have been verified through rigorous automated test suites, functional end-to-end evaluation, and architectural analysis. The work presented herein has not been submitted to any other University or Institution for the award of any degree or diploma."
  ));

  // Signatures Table
  const signTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                spacing: { before: 500, after: 40, line: 280, lineRule: "auto" },
                children: [
                  new TextRun({ text: "Internal Guide:\n", font: FONT_FAMILY, size: 22, bold: true }),
                  new TextRun({ text: "[GUIDE NAME]\n", font: FONT_FAMILY, size: 22 }),
                  new TextRun({ text: "[DESIGNATION]\nDept. of [DEPARTMENT NAME]", font: FONT_FAMILY, size: 20, italics: true }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 500, after: 40, line: 280, lineRule: "auto" },
                children: [
                  new TextRun({ text: "Head of Department:\n", font: FONT_FAMILY, size: 22, bold: true }),
                  new TextRun({ text: "[HEAD OF DEPARTMENT]\n", font: FONT_FAMILY, size: 22 }),
                  new TextRun({ text: "Professor & Head\nDept. of [DEPARTMENT NAME]", font: FONT_FAMILY, size: 20, italics: true }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                spacing: { before: 600, after: 40, line: 280, lineRule: "auto" },
                children: [
                  new TextRun({ text: "Principal:\n", font: FONT_FAMILY, size: 22, bold: true }),
                  new TextRun({ text: "[PRINCIPAL]\n", font: FONT_FAMILY, size: 22 }),
                  new TextRun({ text: "Siddhartha Institute of Tech & Sciences", font: FONT_FAMILY, size: 20, italics: true }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 600, after: 40, line: 280, lineRule: "auto" },
                children: [
                  new TextRun({ text: "External Examiner:\n", font: FONT_FAMILY, size: 22, bold: true }),
                  new TextRun({ text: "[EXTERNAL EXAMINER]\nDate: ________________", font: FONT_FAMILY, size: 20 }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  elements.push(signTable);
  elements.push(new Paragraph({ children: [new PageBreak()] }));

  // ==========================================
  // 2. ACKNOWLEDGEMENT PAGE (Page iii)
  // ==========================================
  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 260, line: 280, lineRule: "auto" },
    children: [
      new TextRun({
        text: "ACKNOWLEDGEMENT",
        font: FONT_FAMILY,
        size: 28,
        bold: true,
        color: "000000",
      }),
    ],
  }));

  elements.push(p(
    "First and foremost, I express my profound gratitude and deepest respect to the Management of Siddhartha Institute of Technology & Sciences (UGC-Autonomous), Narapally, Hyderabad, for providing state-of-the-art infrastructural facilities, high-performance computing labs, and an academically enriching environment that nurtured the development of this project."
  ));

  elements.push(p(
    "I convey my sincere thanks to our esteemed Principal, [PRINCIPAL], for his visionary leadership, continuous encouragement, and for providing the academic ecosystem necessary to pursue cutting-edge engineering research and software development."
  ));

  elements.push(p(
    "I extend my heartfelt gratitude to [HEAD OF DEPARTMENT], Professor and Head of the Department of [DEPARTMENT NAME], for their invaluable guidance, administrative support, and scholastic inspiration throughout the curriculum and project lifecycle."
  ));

  elements.push(p(
    "I owe an enormous debt of gratitude to my esteemed project guide, [GUIDE NAME], [DESIGNATION], Department of [DEPARTMENT NAME], whose meticulous supervision, rigorous technical critiques, intellectual stimulation, and patient mentorship have been instrumental from the conceptualization stage to the final deployment of SlideCraft AI."
  ));

  elements.push(p(
    "I am also deeply thankful to all the faculty members, laboratory instructors, and administrative staff of the Department of [DEPARTMENT NAME] for their direct and indirect contributions, insightful technical recommendations, and constant cooperation."
  ));

  elements.push(p(
    "Special appreciation is extended to my fellow batchmates and friends for their constructive feedback during code reviews, UI evaluation, and usability stress testing. Finally, words cannot capture my eternal gratitude to my parents and family members, whose unconditional love, sacrifices, moral fortitude, and encouragement have been the steadfast foundation of my academic journey."
  ));

  elements.push(new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { before: 360, after: 40, line: 280, lineRule: "auto" },
    children: [
      new TextRun({ text: "[STUDENT NAME]\n", font: FONT_FAMILY, size: 24, bold: true }),
      new TextRun({ text: "Roll No: [ROLL NUMBER]\n", font: FONT_FAMILY, size: 22 }),
      new TextRun({ text: "Dept. of [DEPARTMENT NAME]\nSiddhartha Institute of Technology & Sciences", font: FONT_FAMILY, size: 20, italics: true }),
    ],
  }));

  elements.push(new Paragraph({ children: [new PageBreak()] }));

  // ==========================================
  // 3. TABLE OF CONTENTS (Pages iv - v)
  // ==========================================
  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 260, line: 280, lineRule: "auto" },
    children: [
      new TextRun({
        text: "TABLE OF CONTENTS",
        font: FONT_FAMILY,
        size: 28,
        bold: true,
        color: "000000",
      }),
    ],
  }));

  const tocItems = [
    { title: "CERTIFICATE", page: "ii", bold: true },
    { title: "ACKNOWLEDGEMENT", page: "iii", bold: true },
    { title: "TABLE OF CONTENTS", page: "iv", bold: true },
    { title: "LIST OF FIGURES", page: "vi", bold: true },
    { title: "LIST OF TABLES", page: "vii", bold: true },
    { title: "LIST OF ABBREVIATIONS", page: "viii", bold: true },
    { title: "ABSTRACT", page: "ix", bold: true },
    { title: "CHAPTER 1: INTRODUCTION", page: "1", bold: true },
    { title: "    1.1 Background", page: "1" },
    { title: "    1.2 Evolution of Digital Presentation and Visual Communication", page: "1" },
    { title: "    1.3 Need for AI-Assisted Content and Presentation Generation", page: "2" },
    { title: "    1.4 Problem Statement", page: "3" },
    { title: "    1.5 Motivation", page: "3" },
    { title: "    1.6 Objectives", page: "4" },
    { title: "    1.7 Scope of the Project", page: "4" },
    { title: "    1.8 Significance of the Project", page: "4" },
    { title: "    1.9 Overview of the Proposed System", page: "5" },
    { title: "    1.10 Organization of the Report", page: "5" },
    { title: "CHAPTER 2: LITERATURE REVIEW", page: "6", bold: true },
    { title: "    2.1 Generative Artificial Intelligence", page: "6" },
    { title: "    2.2 Large Language Models", page: "6" },
    { title: "    2.3 Prompt-Based Content Generation", page: "7" },
    { title: "    2.4 AI-Assisted Presentation Systems", page: "7" },
    { title: "    2.5 Retrieval and Context-Aware Generation", page: "8" },
    { title: "    2.6 Text-to-Image Generation", page: "8" },
    { title: "    2.7 Automated Graphic Design", page: "9" },
    { title: "    2.8 Document Processing and Multimodal AI", page: "9" },
    { title: "    2.9 AI-Based Layout Generation", page: "9" },
    { title: "    2.10 Interactive Human-AI Editing", page: "10" },
    { title: "    2.11 Cloud Databases and Authentication", page: "10" },
    { title: "    2.12 Comparative Analysis of Existing Approaches", page: "10" },
    { title: "    2.13 Research / Implementation Gap", page: "10" },
    { title: "CHAPTER 3: PROJECT DESCRIPTION / METHODOLOGY", page: "11", bold: true },
    { title: "    3.1 System Overview", page: "11" },
    { title: "    3.2 System Architecture", page: "11" },
    { title: "    3.3 Functional Requirements", page: "12" },
    { title: "    3.4 Non-Functional Requirements", page: "13" },
    { title: "    3.5 User Workflow", page: "13" },
    { title: "    3.6 Creation Hub", page: "14" },
    { title: "    3.7 Presentation Generation Workflow", page: "14" },
    { title: "    3.8 AI Requirement Analysis", page: "15" },
    { title: "    3.9 Multi-Provider AI Routing", page: "15" },
    { title: "    3.10 Content Generation", page: "16" },
    { title: "    3.11 Content Blueprint Planner", page: "16" },
    { title: "    3.12 Slide Archetype Selection", page: "17" },
    { title: "    3.13 DocumentSpec Architecture", page: "17" },
    { title: "    3.14 Dynamic Visual Direction Engine", page: "18" },
    { title: "    3.15 Procedural Background Generation", page: "18" },
    { title: "    3.16 AI Image Generation", page: "19" },
    { title: "    3.17 Image Prompt Construction", page: "19" },
    { title: "    3.18 Image Framing and Aspect Ratio Handling", page: "19" },
    { title: "    3.19 Slide Rendering", page: "20" },
    { title: "    3.20 Interactive Editor", page: "20" },
    { title: "    3.21 AI Assistant and Modification Workflow", page: "21" },
    { title: "    3.22 Apply-to-All Visual Changes", page: "21" },
    { title: "    3.23 Theme and Background Regeneration", page: "21" },
    { title: "    3.24 Project Isolation and Persistence", page: "22" },
    { title: "    3.25 Supabase Database", page: "22" },
    { title: "    3.26 Authentication", page: "22" },
    { title: "    3.27 Asset Storage", page: "23" },
    { title: "    3.28 Chart and Data Visualization", page: "23" },
    { title: "    3.29 PPTX Export", page: "23" },
    { title: "    3.30 Preview and PPTX Parity", page: "24" },
    { title: "    3.31 Quality Assurance Engine", page: "24" },
    { title: "    3.32 Error Handling", page: "24" },
    { title: "    3.33 Security Considerations", page: "25" },
    { title: "    3.34 Algorithms", page: "25" },
    { title: "    3.35 Flowcharts", page: "26" },
    { title: "    3.36 Data Flow", page: "26" },
    { title: "    3.37 Development Methodology", page: "26" },
    { title: "CHAPTER 4: RESULTS AND DISCUSSION", page: "27", bold: true },
    { title: "    4.1 Implementation Environment", page: "27" },
    { title: "    4.2 User Interface Results", page: "27" },
    { title: "    4.3 Presentation Generation Results", page: "28" },
    { title: "    4.4 Content Planner Results", page: "28" },
    { title: "    4.5 Dynamic Visual Direction Results", page: "28" },
    { title: "    4.6 AI Image Generation Results", page: "29" },
    { title: "    4.7 Slide Editor Results", page: "29" },
    { title: "    4.8 AI Assistant Results", page: "29" },
    { title: "    4.9 Multi-Format Generation Results", page: "30" },
    { title: "    4.10 PPTX Export Results", page: "30" },
    { title: "    4.11 Preview and Export Consistency", page: "30" },
    { title: "    4.12 Functional Testing", page: "31" },
    { title: "    4.13 Integration Testing", page: "31" },
    { title: "    4.14 UI Testing", page: "32" },
    { title: "    4.15 TypeScript / Build Validation", page: "32" },
    { title: "    4.16 Error Handling Validation", page: "32" },
    { title: "    4.17 Performance Considerations", page: "33" },
    { title: "    4.18 Discussion", page: "33" },
    { title: "CHAPTER 5: CONCLUSION AND FUTURE SCOPE", page: "34", bold: true },
    { title: "    5.1 Conclusion", page: "34" },
    { title: "    5.2 Major Contributions", page: "34" },
    { title: "    5.3 Advantages", page: "34" },
    { title: "    5.4 Current Limitations", page: "35" },
    { title: "    5.5 Future Scope", page: "35" },
    { title: "REFERENCES", page: "36", bold: true },
  ];

  tocItems.forEach((item) => {
    elements.push(new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 30, after: 30, line: 260, lineRule: "auto" },
      children: [
        new TextRun({
          text: item.title,
          font: FONT_FAMILY,
          size: 22,
          bold: item.bold || false,
        }),
        new TextRun({
          text: " " + ".".repeat(Math.max(4, 75 - item.title.length)) + " ",
          font: FONT_FAMILY,
          size: 20,
          color: "888888",
        }),
        new TextRun({
          text: item.page,
          font: FONT_FAMILY,
          size: 22,
          bold: item.bold || false,
        }),
      ],
    }));
  });

  elements.push(new Paragraph({ children: [new PageBreak()] }));

  // ==========================================
  // 4. LIST OF FIGURES (Page vi)
  // ==========================================
  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 260, line: 280, lineRule: "auto" },
    children: [
      new TextRun({
        text: "LIST OF FIGURES",
        font: FONT_FAMILY,
        size: 28,
        bold: true,
        color: "000000",
      }),
    ],
  }));

  const figuresList = [
    { num: "Figure 3.1", title: "Overall SlideCraft AI System Architecture", page: "11" },
    { num: "Figure 3.2", title: "User-to-Presentation Generation Workflow", page: "14" },
    { num: "Figure 3.3", title: "Multi-Provider AI Routing Architecture", page: "15" },
    { num: "Figure 3.4", title: "Presentation Generation Pipeline", page: "15" },
    { num: "Figure 3.5", title: "Content Planner Workflow", page: "16" },
    { num: "Figure 3.6", title: "DocumentSpec / AST Architecture", page: "17" },
    { num: "Figure 3.7", title: "Dynamic Visual Direction Pipeline", page: "18" },
    { num: "Figure 3.8", title: "Procedural Background Generation Process", page: "19" },
    { num: "Figure 3.9", title: "AI Image Generation Workflow", page: "19" },
    { num: "Figure 3.10", title: "Slide Rendering Architecture", page: "20" },
    { num: "Figure 3.11", title: "Interactive Editor Architecture", page: "20" },
    { num: "Figure 3.12", title: "AI Assistant Modification Workflow", page: "21" },
    { num: "Figure 3.13", title: "Apply-to-All Slides Workflow", page: "21" },
    { num: "Figure 3.14", title: "Supabase Persistence Architecture", page: "22" },
    { num: "Figure 3.15", title: "PPTX Export Pipeline", page: "23" },
    { num: "Figure 3.16", title: "Preview-to-PPTX Parity Architecture", page: "24" },
    { num: "Figure 3.17", title: "Complete User Journey Data Flow", page: "26" },
  ];

  figuresList.forEach((fig) => {
    elements.push(new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 40, after: 40, line: 260, lineRule: "auto" },
      children: [
        new TextRun({ text: `${fig.num}: `, font: FONT_FAMILY, size: 22, bold: true }),
        new TextRun({ text: fig.title, font: FONT_FAMILY, size: 22 }),
        new TextRun({
          text: " " + ".".repeat(Math.max(4, 70 - (fig.num.length + fig.title.length))) + " ",
          font: FONT_FAMILY,
          size: 20,
          color: "888888",
        }),
        new TextRun({ text: fig.page, font: FONT_FAMILY, size: 22, bold: true }),
      ],
    }));
  });

  elements.push(new Paragraph({ children: [new PageBreak()] }));

  // ==========================================
  // 5. LIST OF TABLES (Page vii)
  // ==========================================
  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 260, line: 280, lineRule: "auto" },
    children: [
      new TextRun({
        text: "LIST OF TABLES",
        font: FONT_FAMILY,
        size: 28,
        bold: true,
        color: "000000",
      }),
    ],
  }));

  const tablesList = [
    { num: "Table 1.1", title: "Project Objectives and Implementation Scope", page: "4" },
    { num: "Table 2.1", title: "Comparative Analysis of Modern Presentation Systems", page: "10" },
    { num: "Table 3.1", title: "Comprehensive Functional Requirements", page: "12" },
    { num: "Table 3.2", title: "Non-Functional Engineering Requirements", page: "13" },
    { num: "Table 3.3", title: "Technology Stack and Core Libraries", page: "13" },
    { num: "Table 3.4", title: "AI Provider Responsibilities and Routing Matrix", page: "16" },
    { num: "Table 3.5", title: "Supported Visual Formats and Spatial Specifications", page: "14" },
    { num: "Table 3.6", title: "Slide Archetypes and Layout Characteristics", page: "17" },
    { num: "Table 3.7", title: "Dynamic Visual Direction Parameters and Ranges", page: "18" },
    { num: "Table 3.8", title: "Database Schema Entities and Relations", page: "22" },
    { num: "Table 3.9", title: "PPTX Export Element Mapping Specifications", page: "23" },
    { num: "Table 4.1", title: "Functional Test Suite Results", page: "31" },
    { num: "Table 4.2", title: "Feature Verification and Quality Audit Results", page: "31" },
    { num: "Table 4.3", title: "Web Preview Canvas to Native PPTX Parity Matrix", page: "30" },
    { num: "Table 5.1", title: "System Limitations and Proposed Future Enhancements", page: "35" },
  ];

  tablesList.forEach((tbl) => {
    elements.push(new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 40, after: 40, line: 260, lineRule: "auto" },
      children: [
        new TextRun({ text: `${tbl.num}: `, font: FONT_FAMILY, size: 22, bold: true }),
        new TextRun({ text: tbl.title, font: FONT_FAMILY, size: 22 }),
        new TextRun({
          text: " " + ".".repeat(Math.max(4, 70 - (tbl.num.length + tbl.title.length))) + " ",
          font: FONT_FAMILY,
          size: 20,
          color: "888888",
        }),
        new TextRun({ text: tbl.page, font: FONT_FAMILY, size: 22, bold: true }),
      ],
    }));
  });

  elements.push(new Paragraph({ children: [new PageBreak()] }));

  // ==========================================
  // 6. LIST OF ABBREVIATIONS (Page viii)
  // ==========================================
  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 260, line: 280, lineRule: "auto" },
    children: [
      new TextRun({
        text: "LIST OF ABBREVIATIONS",
        font: FONT_FAMILY,
        size: 28,
        bold: true,
        color: "000000",
      }),
    ],
  }));

  const abbreviations = [
    { abbr: "AI", full: "Artificial Intelligence" },
    { abbr: "API", full: "Application Programming Interface" },
    { abbr: "AST", full: "Abstract Syntax Tree" },
    { abbr: "CDN", full: "Content Delivery Network" },
    { abbr: "CSV", full: "Comma-Separated Values" },
    { abbr: "CSS", full: "Cascading Style Sheets" },
    { abbr: "DOCX", full: "Microsoft Word Open XML Document" },
    { abbr: "DOM", full: "Document Object Model" },
    { abbr: "FLUX", full: "Black Forest Labs / NVIDIA Diffusion Image Generation Model Family" },
    { abbr: "GPT", full: "Generative Pre-trained Transformer" },
    { abbr: "HTTP", full: "Hypertext Transfer Protocol" },
    { abbr: "JSON", full: "JavaScript Object Notation" },
    { abbr: "JWT", full: "JSON Web Token" },
    { abbr: "LLM", full: "Large Language Model" },
    { abbr: "NLP", full: "Natural Language Processing" },
    { abbr: "PDF", full: "Portable Document Format" },
    { abbr: "PPTX", full: "Microsoft PowerPoint Open XML Presentation" },
    { abbr: "QA", full: "Quality Assurance" },
    { abbr: "RAG", full: "Retrieval-Augmented Generation" },
    { abbr: "REST", full: "Representational State Transfer" },
    { abbr: "SDK", full: "Software Development Kit" },
    { abbr: "SITS", full: "Siddhartha Institute of Technology & Sciences" },
    { abbr: "SQL", full: "Structured Query Language" },
    { abbr: "SSR", full: "Server-Side Rendering" },
    { abbr: "SVG", full: "Scalable Vector Graphics" },
    { abbr: "UI", full: "User Interface" },
    { abbr: "URI", full: "Uniform Resource Identifier" },
    { abbr: "URL", full: "Uniform Resource Locator" },
    { abbr: "UUID", full: "Universally Unique Identifier" },
    { abbr: "UX", full: "User Experience" },
    { abbr: "VPU", full: "Visual Processing Unit" },
    { abbr: "XML", full: "Extensible Markup Language" },
  ];

  abbreviations.forEach((item) => {
    elements.push(new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 20, after: 20, line: 260, lineRule: "auto" },
      children: [
        new TextRun({ text: item.abbr, font: FONT_FAMILY, size: 22, bold: true }),
        new TextRun({
          text: " ".repeat(Math.max(2, 10 - item.abbr.length)) + "—  ",
          font: FONT_FAMILY,
          size: 22,
          bold: true,
          color: "444444",
        }),
        new TextRun({ text: item.full, font: FONT_FAMILY, size: 22 }),
      ],
    }));
  });

  elements.push(new Paragraph({ children: [new PageBreak()] }));

  // ==========================================
  // 7. ABSTRACT (Pages ix - x)
  // ==========================================
  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 260, line: 280, lineRule: "auto" },
    children: [
      new TextRun({
        text: "ABSTRACT",
        font: FONT_FAMILY,
        size: 28,
        bold: true,
        color: "000000",
      }),
    ],
  }));

  elements.push(p(
    "In the contemporary knowledge economy, visual communication assets—predominantly presentations, executive summaries, technical posters, infographics, and analytical charts—serve as indispensable vehicles for disseminating complex ideas, enterprise strategies, and academic findings. Nevertheless, the traditional authoring workflow remains notoriously labor-intensive, fragmented, and cognitively burdensome. Creators are conventionally required to perform sequential research, manual outlining, slide content synthesis, graphic layout design, palette selection, asset sourcing, typography alignment, and final export formatting. This disjointed process results in significant productivity losses and frequently yields visually generic, text-heavy slides suffering from template fatigue and poor aesthetic hierarchy."
  ));

  elements.push(p(
    "While recent advancements in Generative Artificial Intelligence (GenAI) have demonstrated unprecedented efficacy in text and image synthesis, prevailing commercial AI tools suffer from substantial architectural limitations. Many existing systems output non-editable rasterized images or locked, proprietary web canvases lacking true open-standard export parity. Furthermore, most systems route all tasks through monolithic, general-purpose Large Language Models (LLMs), leading to high inference latency, prohibitive operational costs, and stylistic homogenization. More critically, existing interactive editing interfaces frequently suffer from destructive overwriting, wiping slide content, headers, and quantitative metrics upon receiving natural language modification commands."
  ));

  elements.push(p(
    "To overcome these fundamental challenges, this thesis presents SlideCraft AI—an AI-powered, multi-format creative design and presentation generation platform architected upon a typed Document Specification Abstract Syntax Tree (DocumentSpec AST). SlideCraft AI transforms natural language prompts, complex unstructured text, and multi-format document files (PDF, DOCX, CSV, TXT) into fully structured, editable, and visually compelling presentations, posters, infographics, resumes, letters, diagrams, and data reports."
  ));

  elements.push(p(
    "The platform incorporates a novel Multi-Provider AI Routing Architecture that dispatches discrete computational tasks to specialized AI engines based on operational strengths: Groq hosting LLaMA-3.3-70B provides ultra-low-latency structured content synthesis; NVIDIA FLUX API (FLUX.2-klein and FLUX.1-schnell) generates photorealistic, contextually grounded visual imagery with automated negative prompting for text exclusion; Google Gemini delivers deep semantic document analysis and structural blueprint synthesis; and OpenRouter serves as an automated fallback mechanism ensuring high service availability."
  ));

  elements.push(p(
    "To eliminate stylistic uniformity without burdening the user with manual styling decisions, SlideCraft AI introduces a Dynamic Visual Direction Engine. Operating on entropy derived from user topic semantics and cryptographic variation seeds, the engine procedurally synthesizes cohesive, presentation-level design tokens across ten distinct aesthetic style families—such as Deep Navy with Electric Blue Glow, Teal & Emerald Technology, and Dark Aurora Gradients. The system algorithmically modulates surface card translucency, glow vectors, border radiuses, typography pairings, and background canvas gradients while guaranteeing visual accessibility, contrast parity, and structural consistency across slides."
  ));

  elements.push(p(
    "For user collaboration, the platform implements a dual-stage interaction paradigm comprising a Presentation Blueprint Planner and an Interactive Unified Studio Editor. The Planner enables structured inspection, slide reordering, content refinement, and slide-level locking prior to generation. The Studio Editor features a non-destructive, atomic patch-based AI Assistant capable of surgical modifications—such as layout archetype alterations, visual asset synthesis, and tone adjustments—while rigorously preserving 100% of underlying user data, headlines, and metrics."
  ));

  elements.push(p(
    "Furthermore, SlideCraft AI integrates client-side native PowerPoint export via pptxgenjs, establishing strict structural and visual parity between the responsive HTML5/Tailwind web canvas and downloaded Microsoft PowerPoint (.pptx) presentations. Persistence and user isolation are maintained through Supabase PostgreSQL, row-level security, and edge authentication middleware. Empirical evaluations validate that the platform achieves sub-2-second slide generation throughput, zero TypeScript compilation errors, and complete visual fidelity upon native PowerPoint playback, providing an open, accessible, and high-performance foundation for automated visual communication."
  ));

  elements.push(new Paragraph({
    spacing: { before: 180, after: 100, line: 280, lineRule: "auto" },
    children: [
      new TextRun({
        text: "Keywords: ",
        font: FONT_FAMILY,
        size: 22,
        bold: true,
        color: "000000",
      }),
      new TextRun({
        text: "Artificial Intelligence, Large Language Models, Multi-Provider Routing, DocumentSpec AST, Dynamic Visual Direction, NVIDIA FLUX, Presentation Blueprint Planner, Atomic Patch Engine, Native PPTX Parity, Supabase PostgreSQL.",
        font: FONT_FAMILY,
        size: 22,
        italics: true,
        color: "222222",
      }),
    ],
  }));

  elements.push(new Paragraph({ children: [new PageBreak()] }));

  return elements;
}

module.exports = { createPreliminaryPages };
