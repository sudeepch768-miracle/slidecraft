const {
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  PageBreak,
  ShadingType
} = require("docx");

const FONT_FAMILY = "Times New Roman";
const MONO_FONT = "Consolas";

function p(textOrRuns, options = {}) {
  let children = [];
  if (typeof textOrRuns === "string") {
    children = [
      new TextRun({
        text: textOrRuns,
        font: FONT_FAMILY,
        size: options.size || 24,
        bold: options.bold || false,
        italics: options.italics || false,
        color: options.color || "000000",
      }),
    ];
  } else if (Array.isArray(textOrRuns)) {
    children = textOrRuns.map((item) => {
      if (typeof item === "string") {
        return new TextRun({
          text: item,
          font: FONT_FAMILY,
          size: options.size || 24,
          color: options.color || "000000",
        });
      }
      return new TextRun({
        font: FONT_FAMILY,
        size: options.size || 24,
        color: "000000",
        ...item,
      });
    });
  }

  return new Paragraph({
    alignment: options.alignment || AlignmentType.LEFT,
    spacing: {
      line: 360,
      lineRule: "auto",
      before: options.spaceBefore !== undefined ? options.spaceBefore : 0,
      after: options.spaceAfter !== undefined ? options.spaceAfter : 240,
    },
    children,
  });
}

function chapterHeading(title, pageBreakBefore = true) {
  const paras = [];
  if (pageBreakBefore) {
    paras.push(new Paragraph({ children: [new PageBreak()] }));
  }
  paras.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: {
        before: 280,
        after: 360,
        line: 360,
        lineRule: "auto",
      },
      children: [
        new TextRun({
          text: title.toUpperCase(),
          font: FONT_FAMILY,
          size: 28,
          bold: true,
          color: "000000",
        }),
      ],
    })
  );
  return paras;
}

function sectionHeading(title) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: {
      before: 360,
      after: 240,
      line: 360,
      lineRule: "auto",
    },
    children: [
      new TextRun({
        text: title.toUpperCase(),
        font: FONT_FAMILY,
        size: 24,
        bold: true,
        color: "000000",
      }),
    ],
  });
}

function subsectionHeading(title) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: {
      before: 280,
      after: 200,
      line: 360,
      lineRule: "auto",
    },
    children: [
      new TextRun({
        text: title,
        font: FONT_FAMILY,
        size: 24,
        bold: true,
        color: "000000",
      }),
    ],
  });
}

function subSubsectionHeading(title) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: {
      before: 200,
      after: 160,
      line: 360,
      lineRule: "auto",
    },
    children: [
      new TextRun({
        text: title,
        font: FONT_FAMILY,
        size: 24,
        bold: true,
        italics: true,
        color: "000000",
      }),
    ],
  });
}

function createTable(captionText, headers, rows, colWidths = []) {
  const elements = [];

  elements.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 240, after: 120, line: 240, lineRule: "auto" },
      children: [
        new TextRun({
          text: captionText,
          font: FONT_FAMILY,
          size: 24,
          bold: true,
          color: "000000",
        }),
      ],
    })
  );

  const totalCols = headers.length;
  const defaultWidth = Math.floor(100 / totalCols);

  const headerCells = headers.map((h, i) => {
    const widthPct = colWidths[i] || defaultWidth;
    return new TableCell({
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      shading: { fill: "F0F4F8", type: ShadingType.CLEAR },
      margins: { top: 120, bottom: 120, left: 140, right: 140 },
      children: [
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: 40, after: 40, line: 280, lineRule: "auto" },
          children: [
            new TextRun({
              text: h,
              font: FONT_FAMILY,
              size: 22,
              bold: true,
              color: "111827",
            }),
          ],
        }),
      ],
    });
  });

  const tableRows = [
    new TableRow({
      tableHeader: true,
      children: headerCells,
    }),
  ];

  rows.forEach((row, rowIndex) => {
    const rowCells = row.map((cellText, i) => {
      const widthPct = colWidths[i] || defaultWidth;
      const isAltRow = rowIndex % 2 === 1;
      return new TableCell({
        width: { size: widthPct, type: WidthType.PERCENTAGE },
        shading: isAltRow ? { fill: "FAFAFA", type: ShadingType.CLEAR } : undefined,
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        children: [
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 30, after: 30, line: 280, lineRule: "auto" },
            children: [
              new TextRun({
                text: cellText,
                font: FONT_FAMILY,
                size: 21,
                color: "1F2937",
              }),
            ],
          }),
        ],
      });
    });
    tableRows.push(new TableRow({ children: rowCells }));
  });

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 8, color: "CBD5E1" },
      bottom: { style: BorderStyle.SINGLE, size: 8, color: "CBD5E1" },
      left: { style: BorderStyle.SINGLE, size: 8, color: "CBD5E1" },
      right: { style: BorderStyle.SINGLE, size: 8, color: "CBD5E1" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
    },
    rows: tableRows,
  });

  elements.push(table);
  elements.push(new Paragraph({ spacing: { before: 0, after: 280 }, children: [] }));
  return elements;
}

function createFigure(diagramLines, captionText) {
  const elements = [];

  const diagramParagraphs = diagramLines.map((line) => {
    return new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 0, line: 240, lineRule: "auto" },
      children: [
        new TextRun({
          text: line,
          font: MONO_FONT,
          size: 15,
          color: "1E293B",
        }),
      ],
    });
  });

  const diagramCell = new TableCell({
    width: { size: 100, type: WidthType.PERCENTAGE },
    shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
    margins: { top: 140, bottom: 140, left: 180, right: 180 },
    children: diagramParagraphs,
  });

  const diagramTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 8, color: "94A3B8" },
      bottom: { style: BorderStyle.SINGLE, size: 8, color: "94A3B8" },
      left: { style: BorderStyle.SINGLE, size: 8, color: "94A3B8" },
      right: { style: BorderStyle.SINGLE, size: 8, color: "94A3B8" },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [new TableRow({ children: [diagramCell] })],
  });

  elements.push(diagramTable);

  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 280, line: 240, lineRule: "auto" },
      children: [
        new TextRun({
          text: captionText,
          font: FONT_FAMILY,
          size: 24,
          bold: true,
          color: "000000",
        }),
      ],
    })
  );

  return elements;
}

function createAlgorithm(algorithmNumber, title, steps) {
  const elements = [];

  elements.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 240, after: 80, line: 240, lineRule: "auto" },
      children: [
        new TextRun({
          text: `Algorithm ${algorithmNumber}: ${title}`,
          font: FONT_FAMILY,
          size: 24,
          bold: true,
          color: "000000",
        }),
      ],
    })
  );

  const stepParagraphs = steps.map((step) => {
    return new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 20, after: 20, line: 260, lineRule: "auto" },
      children: [
        new TextRun({
          text: step,
          font: MONO_FONT,
          size: 17,
          color: "0F172A",
        }),
      ],
    });
  });

  const algoCell = new TableCell({
    width: { size: 100, type: WidthType.PERCENTAGE },
    shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
    margins: { top: 140, bottom: 140, left: 180, right: 180 },
    children: stepParagraphs,
  });

  const algoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 8, color: "64748B" },
      bottom: { style: BorderStyle.SINGLE, size: 8, color: "64748B" },
      left: { style: BorderStyle.SINGLE, size: 8, color: "64748B" },
      right: { style: BorderStyle.SINGLE, size: 8, color: "64748B" },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [new TableRow({ children: [algoCell] })],
  });

  elements.push(algoTable);
  elements.push(new Paragraph({ spacing: { before: 0, after: 280 }, children: [] }));
  return elements;
}

module.exports = {
  p,
  chapterHeading,
  sectionHeading,
  subsectionHeading,
  subSubsectionHeading,
  createTable,
  createFigure,
  createAlgorithm,
  FONT_FAMILY,
};
