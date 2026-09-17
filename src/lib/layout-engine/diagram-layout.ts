import { DiagramElement } from "@/types/document-spec";
import { BoundingBox } from "./grid-calculator";

export interface PositionedNode {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  status?: string;
  box: BoundingBox;
}

export interface PositionedConnector {
  fromId: string;
  toId: string;
  label?: string;
  fromPoint: { x: number; y: number };
  toPoint: { x: number; y: number };
}

export function computeDiagramLayout(
  diagram: DiagramElement,
  containerBox: BoundingBox
): { nodes: PositionedNode[]; connectors: PositionedConnector[] } {
  const count = diagram.nodes.length;
  if (count === 0) return { nodes: [], connectors: [] };

  const nodes: PositionedNode[] = [];
  const connectors: PositionedConnector[] = [];

  if (diagram.diagramType === "process_steps" || diagram.diagramType === "flowchart") {
    // Horizontal linear flow
    const nodeWidth = Math.min(240, (containerBox.w - (count - 1) * 32) / count);
    const nodeHeight = 120;
    const spacing = (containerBox.w - count * nodeWidth) / Math.max(1, count - 1);
    const yCenter = containerBox.y + (containerBox.h - nodeHeight) / 2;

    diagram.nodes.forEach((node, i) => {
      const x = containerBox.x + i * (nodeWidth + spacing);
      nodes.push({
        ...node,
        box: { x, y: yCenter, w: nodeWidth, h: nodeHeight },
      });
    });

    // Compute sequential connectors
    for (let i = 0; i < nodes.length - 1; i++) {
      const from = nodes[i];
      const to = nodes[i + 1];
      connectors.push({
        fromId: from.id,
        toId: to.id,
        fromPoint: { x: from.box.x + from.box.w, y: from.box.y + from.box.h / 2 },
        toPoint: { x: to.box.x, y: to.box.y + to.box.h / 2 },
      });
    }
  } else if (diagram.diagramType === "funnel") {
    // Top-to-bottom descending funnel
    const stepHeight = (containerBox.h - (count - 1) * 16) / count;
    diagram.nodes.forEach((node, i) => {
      const widthRatio = 1 - i * 0.15; // gradually narrower
      const w = containerBox.w * Math.max(0.4, widthRatio);
      const x = containerBox.x + (containerBox.w - w) / 2;
      const y = containerBox.y + i * (stepHeight + 16);
      nodes.push({
        ...node,
        box: { x, y, w, h: stepHeight },
      });
    });
  } else {
    // Default grid layout for cycles / hierarchy
    const cols = count <= 3 ? count : Math.ceil(count / 2);
    const rows = Math.ceil(count / cols);
    const cellW = (containerBox.w - (cols - 1) * 24) / cols;
    const cellH = (containerBox.h - (rows - 1) * 24) / rows;

    diagram.nodes.forEach((node, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = containerBox.x + col * (cellW + 24);
      const y = containerBox.y + row * (cellH + 24);
      nodes.push({
        ...node,
        box: { x, y, w: cellW, h: cellH },
      });
    });
  }

  return { nodes, connectors };
}
