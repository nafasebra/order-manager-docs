# Export module

Import utilities from `@/lib/export`. No dependencies have been added. DataTable now offers CSV and PDF actions for the current page in its displayed sort order, across admin, seller, and buyer tables. It exports only visible accessor columns, not action buttons or hidden record fields. Existing queries determine permission and tenant scope; no additional records are fetched. Empty/loading tables disable export.

DataTable accepts `exports={false}` to disable downloads, or `exports={{ filename, title, columns }}` for an explicit field allowlist and formatted values. Without custom columns, primitive accessor values are used rather than JSX cell content; nested objects are not serialized. PDF opens native printing, not a direct PDF download. Paginated tables export only the current page, never all matching records.

```ts
import { exportToCsv, exportToPdf, type ExportColumn } from "@/lib/export";

type Row = { code: string; total: number };
const columns: ExportColumn<Row>[] = [
  { header: "Order", value: (row) => row.code },
  { header: "Total", value: (row) => row.total },
];
const options = { filename: "orders", rows: selectedRows, columns };
exportToCsv(options);
// Separate action: opens printing; user chooses Save as PDF.
await exportToPdf({ ...options, title: "Orders", orientation: "landscape" });
```

Replace selectedRows with the explicitly authorized dataset. The module does not fetch records, infer filters, choose pagination scope, or enforce permissions. Export only approved tenant-scoped fields; internal notes and other sellers' data must not leak through an export. Format dates/money in column value callbacks when desired. Null/undefined produce empty cells.

CSV uses comma separators, CRLF rows, quoted/escaped cells, a UTF-8 BOM, and formula protection for string values. Formula-like strings receive a leading apostrophe intentionally; negative numeric values remain numeric. Export callbacks should return primitives, not JSX or objects.

PDF uses a standalone HTML table and native browser printing, not a generated binary PDF download. It supports A4 portrait/landscape, escaped Unicode text, RTL direction, repeated table headings, and natural pagination. Filename is a report-title fallback, not a guaranteed saved filename. The promise indicates print invocation, not that the user saved a file; cancellation cannot be reliably detected. Browser print headers, fonts, output layout, and PDF destination remain user/browser-controlled. CSP restrictions on iframe reports may require host configuration. Verify target browsers before integration.

Both exports build the report in memory; large datasets need pagination/size limits or a server-side export implementation. PDF binary generation or automatic PDF downloads would require a separately approved implementation/dependency.

Serializer tests were added but not run. Native downloading, print-dialog behavior, multipage output, RTL/fonts, and cleanup still require browser QA. No builds or tests were run for this change.
