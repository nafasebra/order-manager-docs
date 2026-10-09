export type ExportValue = string | number | boolean | null | undefined;

export type ExportColumn<T> = {
  header: string;
  /** Return a display-ready value; format money/dates at the call site. */
  value: (row: T) => ExportValue;
};

export type ExportOptions<T> = {
  rows: readonly T[];
  columns: readonly ExportColumn<T>[];
  filename: string;
};

export function validateColumns<T>(columns: readonly ExportColumn<T>[]) {
  if (columns.length === 0) throw new Error("At least one export column is required.");
}
