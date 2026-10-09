import { validateColumns, type ExportOptions, type ExportValue } from "./types";

function csvCell(value: ExportValue): string {
  let text = value == null ? "" : String(value);
  // Protect string cells (including headers) from spreadsheet formula injection.
  // Numeric negative values remain numeric.
  if (typeof value === "string" && /^[\s\u0000-\u001f]*[=+@-]|^[\t\r\n]/.test(text)) {
    text = `'${text}`;
  }
  return `"${text.replaceAll('"', '""')}"`;
}

export function createCsv<T>({ rows, columns }: Pick<ExportOptions<T>, "rows" | "columns">): string {
  validateColumns(columns);
  return [
    columns.map((column) => csvCell(column.header)).join(","),
    ...rows.map((row) => columns.map((column) => csvCell(column.value(row))).join(",")),
  ].join("\r\n");
}

/** Downloads UTF-8 CSV with a BOM for common spreadsheet applications. */
export function exportToCsv<T>(options: ExportOptions<T>): void {
  const csv = createCsv(options);
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const name = options.filename.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_").trim() || "export";
  link.href = url;
  link.download = name.toLowerCase().endsWith(".csv") ? name : `${name}.csv`;
  link.hidden = true;
  document.body.append(link);
  try {
    link.click();
  } finally {
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
