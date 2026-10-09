import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { DataTable } from "./DataTable";
import { exportToCsv, exportToPdf } from "@/lib/export";

vi.mock("@/lib/export", () => ({
  exportToCsv: vi.fn(),
  exportToPdf: vi.fn().mockResolvedValue(undefined),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const data = [
  { name: "Bravo", privateNote: "secret" },
  { name: "Alpha", privateNote: "internal" },
];
const columns = [
  { accessorKey: "name", header: "Name" },
  { id: "actions", header: "Actions", cell: () => "View" },
];

describe("table exports", () => {
  it("exports displayed sorted rows, excluding actions and hidden fields", () => {
    render(<DataTable data={data} columns={columns} />);
    fireEvent.click(screen.getByRole("button", { name: "Name" }));
    fireEvent.click(screen.getByRole("button", { name: "Export CSV" }));
    const options = vi.mocked(exportToCsv).mock.calls[0][0];
    expect(options.rows).toEqual([data[1], data[0]]);
    expect(options.columns.map((column) => column.header)).toEqual(["Name"]);
    expect(options.columns[0].value(options.rows[0])).toBe("Alpha");
    expect(options.filename).toContain("current-page");
  });

  it("passes configured title and filename to PDF printing", async () => {
    render(<DataTable data={data} columns={columns} exports={{ filename: "customers", title: "Customers" }} />);
    fireEvent.click(screen.getByRole("button", { name: "Export PDF" }));
    await waitFor(() => expect(exportToPdf).toHaveBeenCalledOnce());
    expect(vi.mocked(exportToPdf).mock.calls[0][0]).toMatchObject({
      filename: "customers", title: "Customers", rows: data,
    });
  });

  it("disables exports for empty or loading tables", () => {
    const view = render(<DataTable data={[]} columns={columns} />);
    expect(screen.getByRole("button", { name: "Export CSV" }).hasAttribute("disabled")).toBe(true);
    view.rerender(<DataTable data={data} columns={columns} isLoading />);
    expect(screen.getByRole("button", { name: "Export PDF" }).hasAttribute("disabled")).toBe(true);
  });

  it("allows individual tables to opt out", () => {
    render(<DataTable data={data} columns={columns} exports={false} />);
    expect(screen.queryByRole("button", { name: "Export CSV" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Export PDF" })).toBeNull();
  });
});
