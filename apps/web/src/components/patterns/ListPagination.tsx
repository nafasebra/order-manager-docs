import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type ListPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function ListPagination({
  page,
  pageSize,
  total,
  onPageChange,
}: ListPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < pageCount;

  return (
    <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {pageCount} · {total} total
      </p>
      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="ghost"
              size="sm"
              disabled={!canPrev}
              onClick={() => onPageChange(page - 1)}
              aria-label="Go to previous page"
            >
              Previous
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button
              variant="ghost"
              size="sm"
              disabled={!canNext}
              onClick={() => onPageChange(page + 1)}
              aria-label="Go to next page"
            >
              Next
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
};
