import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface ListPaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function ListPagination({ page, pageSize, total, onPageChange }: ListPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  if (totalPages <= 1) return null

  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
      </p>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (page > 1) onPageChange(page - 1)
              }}
              className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = i + 1
            return (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === page}
                  onClick={(e) => {
                    e.preventDefault()
                    onPageChange(p)
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          })}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (page < totalPages) onPageChange(page + 1)
              }}
              className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
