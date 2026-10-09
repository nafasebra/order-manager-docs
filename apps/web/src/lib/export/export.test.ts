import { describe, expect, it } from "vitest";
import { createCsv, createPdfHtml } from "./index";

describe("export serialization", () => {
  it("escapes CSV quotes, delimiters, and multiline values", () => {
    expect(createCsv({ rows: ['a,"b"\nc'], columns: [{ header: "Value", value: (row) => row }] }))
      .toBe('"Value"\r\n"a,""b""\nc"');
  });
  it("protects formulas without altering numeric negatives", () => {
    expect(createCsv({ rows: [" =1+1", -12], columns: [{ header: "=HEADER", value: (row) => row }] }))
      .toBe('"\'=HEADER"\r\n"\' =1+1"\r\n"-12"');
  });
  it("handles Unicode, missing values, and empty datasets", () => {
    const columns = [{ header: "نام", value: (row: string | null) => row }];
    expect(createCsv({ rows: ["سلام", null], columns })).toBe('"نام"\r\n"سلام"\r\n""');
    expect(createCsv({ rows: [], columns })).toBe('"نام"');
  });
  it("escapes HTML in titles, headers, descriptions, and values", () => {
    const html = createPdfHtml({ filename: "report", title: "<script>", description: "<img>", rows: ["<b>&"], columns: [{ header: "<th>", value: (row) => row }], direction: "rtl" });
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&lt;img&gt;');
    expect(html).toContain('&lt;th&gt;');
    expect(html).toContain('&lt;b&gt;&amp;');
    expect(html).toContain('dir="rtl"');
    expect(html).not.toContain('<script>');
  });
  it("rejects exports without columns", () => {
    expect(() => createCsv({ rows: [], columns: [] })).toThrow();
    expect(() => createPdfHtml({ filename: "report", rows: [], columns: [] })).toThrow();
  });
});
