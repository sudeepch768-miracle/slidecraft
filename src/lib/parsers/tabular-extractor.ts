import Papa from "papaparse";

export interface TabularData {
  headers: string[];
  rows: string[][];
  summary: string;
}

export function extractTabularData(csvString: string): TabularData {
  const parsed = Papa.parse<string[]>(csvString.trim(), {
    skipEmptyLines: true,
  });

  if (!parsed.data || parsed.data.length === 0) {
    return { headers: [], rows: [], summary: "Empty table" };
  }

  const headers = parsed.data[0];
  const rows = parsed.data.slice(1);

  const summary = `Tabular dataset with ${rows.length} rows and ${headers.length} columns: [${headers.join(", ")}]`;

  return {
    headers,
    rows,
    summary,
  };
}
