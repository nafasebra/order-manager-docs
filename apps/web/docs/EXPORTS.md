# Export module

Import utilities from `@/lib/export`. No pages, buttons, or dependencies have been added. Call exports from a user action once the desired integration locations are chosen.

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
