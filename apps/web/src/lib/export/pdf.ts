import { validateColumns, type ExportOptions } from "./types";

export type PdfExportOptions<T> = ExportOptions<T> & {
  title?: string;
  description?: string;
  orientation?: "portrait" | "landscape";
  direction?: "ltr" | "rtl";
};

function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

/** A standalone printable report; never interprets exported values as HTML. */
export function createPdfHtml<T>(options: PdfExportOptions<T>): string {
  validateColumns(options.columns);
  const title = options.title ?? options.filename;
  const orientation = options.orientation === "landscape" ? "landscape" : "portrait";
  const direction = options.direction === "rtl" ? "rtl" : "ltr";
  return `<!doctype html><html dir="${direction}"><head><meta charset="utf-8">
<title>${escapeHtml(title)}</title><style>
@page { size: A4 ${orientation}; margin: 15mm; }
body { font: 12px system-ui, sans-serif; color: #111; margin: 0; }
h1 { font-size: 22px; margin: 0 0 8px; }
p { white-space: pre-wrap; overflow-wrap: anywhere; }
table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: 20px; }
th, td { border: 1px solid #ccc; padding: 8px; text-align: start; overflow-wrap: anywhere; white-space: pre-wrap; }
th { background: #eee; font-weight: 600; }
thead { display: table-header-group; }
tr { break-inside: avoid; }
</style></head><body><h1>${escapeHtml(title)}</h1>
${options.description ? `<p>${escapeHtml(options.description)}</p>` : ""}
<table><thead><tr>${options.columns.map((column) => `<th scope="col">${escapeHtml(column.header)}</th>`).join("")}</tr></thead>
<tbody>${options.rows.map((row) => `<tr>${options.columns.map((column) => `<td>${escapeHtml(column.value(row))}</td>`).join("")}</tr>`).join("")}</tbody></table>
${options.rows.length === 0 ? "<p>No records to export.</p>" : ""}</body></html>`;
}

/** Opens browser printing. The user must choose Save as PDF; no binary download. */
export async function exportToPdf<T>(options: PdfExportOptions<T>): Promise<void> {
  const html = createPdfHtml(options);
  const frame = document.createElement("iframe");
  frame.title = "Printable export";
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;left:-10000px;top:0;width:1000px;height:1px;border:0";
  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      frame.remove();
      reject(new Error("The printable report could not be loaded."));
    }, 15000);
    frame.onload = () => {
      window.clearTimeout(timeout);
      const reportWindow = frame.contentWindow;
      if (!reportWindow) {
        frame.remove();
        reject(new Error("Browser printing is unavailable."));
        return;
      }
      reportWindow.addEventListener("afterprint", () => frame.remove(), { once: true });
      // Fallback cleanup for browsers that omit afterprint.
      window.setTimeout(() => frame.remove(), 300000);
      void (async () => {
        try {
          await reportWindow.document.fonts?.ready;
          reportWindow.focus();
          reportWindow.print();
          resolve();
        } catch (error) {
          frame.remove();
          reject(error);
        }
      })();
    };
    frame.srcdoc = html;
    document.body.append(frame);
  });
}
