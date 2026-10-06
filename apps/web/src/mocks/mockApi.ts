import type { ListParams, Paginated } from "@/types";

const DELAY_MS = 180;

export function delay(ms = DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type ListOptions<T> = {
  items: T[];
  params?: ListParams;
  searchKeys?: (keyof T)[];
  statusKey?: keyof T;
};

export async function listResource<T extends object>(
  options: ListOptions<T>,
): Promise<Paginated<T>> {
  await delay();
  const page = Number(options.params?.page ?? 1);
  const pageSize = Number(options.params?.pageSize ?? 25);
  const q = String(options.params?.q ?? "")
    .trim()
    .toLowerCase();
  const status = options.params?.status
    ? String(options.params.status)
    : undefined;
  const sort = options.params?.sort;

  let rows = [...options.items];

  if (q && options.searchKeys?.length) {
    rows = rows.filter((item) =>
      options.searchKeys!.some((key) =>
        String(item[key] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }

  if (status && options.statusKey) {
    rows = rows.filter((item) => String(item[options.statusKey!]) === status);
  }

  if (sort) {
    const desc = sort.startsWith("-");
    const key = (desc ? sort.slice(1) : sort) as keyof T;
    rows.sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (av === bv) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" });
      return desc ? -cmp : cmp;
    });
  }

  const total = rows.length;
  const start = (page - 1) * pageSize;
  const items = rows.slice(start, start + pageSize);

  return { items, total, page, pageSize };
}

export async function getById<T extends { id: string }>(
  items: T[],
  id: string,
): Promise<T> {
  await delay();
  const found = items.find((item) => item.id === id);
  if (!found) {
    const err = new Error("Not found") as Error & { status: number };
    err.status = 404;
    throw err;
  }
  return found;
}
