import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useListQuery } from "./useListQuery";
import { listSearchSchema } from "@/lib/router/search";
import { listResource } from "@/mocks/mockApi";
describe("list search", () => {
  it("keeps status and query in route state and resets the page on search", () => {
    const update = vi.fn();
    const { result, rerender } = renderHook(
      ({ q }) => useListQuery({ q, page: 4 }, update),
      { initialProps: { q: "old" } },
    );
    result.current[1]("new");
    expect(update).toHaveBeenCalledWith({ q: "new", page: 1 });
    rerender({ q: "back-navigation" });
    expect(result.current[0]).toBe("back-navigation");
    expect(
      listSearchSchema.parse({ status: "published", q: "new" }).status,
    ).toBe("published");
  });
  it("filters and sorts the entire result before pagination", async () => {
    const items = Array.from({ length: 40 }, (_, id) => ({
      id,
      name: `Item ${id}`,
      status: id % 2 ? "draft" : "published",
    }));
    const result = await listResource({
      items,
      params: { status: "published", sort: "-id", page: 2, pageSize: 5 },
      statusKey: "status",
    });
    expect(result.total).toBe(20);
    expect(result.items.map((item) => item.id)).toEqual([28, 26, 24, 22, 20]);
  });
});
