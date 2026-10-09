import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exportToCsv, exportToPdf } from "./index";

const options = {
  filename: "orders",
  rows: [{ code: "ORD-1" }],
  columns: [{ header: "Order", value: (row: { code: string }) => row.code }],
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.querySelectorAll('a[download], iframe[title="Printable export"]')
    .forEach((element) => element.remove());
});

describe("CSV download", () => {
  function mockDownload() {
    const createObjectURL = vi.fn<(value: Blob | MediaSource) => string>(
      () => "blob:export-test",
    );
    const revokeObjectURL = vi.fn<(url: string) => void>();
    // jsdom does not implement object URLs; keep the original URL constructor.
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true, writable: true, value: URL.createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true, writable: true, value: URL.revokeObjectURL,
    });
    vi.spyOn(URL, "createObjectURL").mockImplementation(createObjectURL);
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(revokeObjectURL);
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const append = vi.spyOn(document.body, "append");
    return { createObjectURL, revokeObjectURL, click, append };
  }

  it("downloads a CSV blob and removes the temporary link", () => {
    const mocks = mockDownload();
    exportToCsv(options);
    expect(mocks.click).toHaveBeenCalledOnce();
    const link = mocks.append.mock.calls[0][0] as HTMLAnchorElement;
    expect(link.download).toBe("orders.csv");
    expect(link.href).toBe("blob:export-test");
    expect(link.isConnected).toBe(false);
    const blob = mocks.createObjectURL.mock.calls[0][0] as unknown as Blob;
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("text/csv;charset=utf-8");
    expect(mocks.revokeObjectURL).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(mocks.revokeObjectURL).toHaveBeenCalledWith("blob:export-test");
  });

  it.each([
    ["report.CSV", "report.CSV"],
    ["a/b:c", "a_b_c.csv"],
    ["  ", "export.csv"],
  ])("normalizes filename %s", (filename, expected) => {
    const mocks = mockDownload();
    exportToCsv({ ...options, filename });
    const link = mocks.append.mock.calls[0][0] as HTMLAnchorElement;
    expect(link.download).toBe(expected);
  });

  it("cleans up even when clicking the download fails", () => {
    const mocks = mockDownload();
    mocks.click.mockImplementation(() => { throw new Error("download blocked"); });
    expect(() => exportToCsv(options)).toThrow("download blocked");
    const link = mocks.append.mock.calls[0][0] as HTMLAnchorElement;
    expect(link.isConnected).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(mocks.revokeObjectURL).toHaveBeenCalledOnce();
  });
});

describe("PDF print lifecycle", () => {
  function mockReport() {
    const frame = document.createElement("iframe");
    const remove = vi.spyOn(frame, "remove");
    const events = new EventTarget();
    const print = vi.fn();
    const focus = vi.fn();
    const reportWindow = {
      document: { fonts: { ready: Promise.resolve() } },
      focus, print,
      addEventListener: events.addEventListener.bind(events),
    };
    Object.defineProperty(frame, "contentWindow", { configurable: true, value: reportWindow });
    const createElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag, elementOptions) =>
      tag === "iframe" ? frame : createElement(tag, elementOptions),
    );
    // Avoid jsdom's automatic iframe navigation; dispatch load explicitly.
    vi.spyOn(document.body, "append").mockImplementation(() => {});
    return { frame, remove, events, print, focus };
  }

  it("prints only after loading, then cleans up afterprint", async () => {
    const report = mockReport();
    const pending = exportToPdf(options);
    expect(report.print).not.toHaveBeenCalled();
    expect(report.frame.srcdoc).toContain("ORD-1");
    report.frame.dispatchEvent(new Event("load"));
    await pending;
    expect(report.focus).toHaveBeenCalledOnce();
    expect(report.print).toHaveBeenCalledOnce();
    report.events.dispatchEvent(new Event("afterprint"));
    expect(report.remove).toHaveBeenCalled();
  });

  it("provides fallback cleanup when afterprint is absent", async () => {
    const report = mockReport();
    const pending = exportToPdf(options);
    report.frame.dispatchEvent(new Event("load"));
    await pending;
    vi.advanceTimersByTime(300000);
    expect(report.remove).toHaveBeenCalled();
  });

  it("rejects and removes reports that never load", async () => {
    const report = mockReport();
    const result = expect(exportToPdf(options)).rejects.toThrow("could not be loaded");
    vi.advanceTimersByTime(15000);
    await result;
    expect(report.remove).toHaveBeenCalled();
    expect(report.print).not.toHaveBeenCalled();
  });

  it("rejects when an iframe window is unavailable", async () => {
    const report = mockReport();
    Object.defineProperty(report.frame, "contentWindow", { value: null });
    const result = expect(exportToPdf(options)).rejects.toThrow("printing is unavailable");
    report.frame.dispatchEvent(new Event("load"));
    await result;
    expect(report.remove).toHaveBeenCalled();
  });

  it("propagates printing failures and removes the report", async () => {
    const report = mockReport();
    report.print.mockImplementation(() => { throw new Error("print blocked"); });
    const result = expect(exportToPdf(options)).rejects.toThrow("print blocked");
    report.frame.dispatchEvent(new Event("load"));
    await result;
    expect(report.remove).toHaveBeenCalled();
  });
});
