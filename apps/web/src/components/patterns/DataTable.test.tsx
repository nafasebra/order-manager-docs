import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DataTable } from "./DataTable";
afterEach(cleanup);
describe("table interactions", () => {
  it("sorts text and numeric fields ascending and descending", () => {
    render(
      <DataTable
        data={[
          { name: "Bravo", stock: 20 },
          { name: "Alpha", stock: 3 },
        ]}
        columns={[
          { accessorKey: "name", header: "Name" },
          { accessorKey: "stock", header: "Stock" },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Name" }));
    expect(screen.getAllByRole("row")[1].textContent).toContain("Alpha");
    fireEvent.click(screen.getByRole("button", { name: "Name" }));
    expect(screen.getAllByRole("row")[1].textContent).toContain("Bravo");
    fireEvent.click(screen.getByRole("button", { name: "Stock" }));
    expect(screen.getAllByRole("row")[1].textContent).toContain("3");
    fireEvent.click(screen.getByRole("button", { name: "Stock" }));
    expect(screen.getAllByRole("row")[1].textContent).toContain("20");
  });
});
