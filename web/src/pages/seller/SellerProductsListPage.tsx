import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader, FilterBar, DataTable, ListPagination } from '@/components/patterns'
import { StatusChip } from '@/components/patterns/StatusChip'
import { Button } from '@/components/ui/button'
import { products } from '@/lib/api'
import { ME_QUERY_KEY } from '@/lib/router/context'
import { useListSearch } from '@/lib/router/useListSearch'
import type { ProductsSearch } from '@/lib/router/searchSchemas'
import type { SessionUser } from '@/types'
import { formatMoney } from '@/lib/utils'
import type { ProductListItem } from '@/lib/api/products'

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'archived', label: 'Archived' },
]

const columns: ColumnDef<ProductListItem>[] = [
  { accessorKey: 'name', header: 'Product', meta: { sortable: true } },
  {
    accessorKey: 'price',
    header: 'Price',
    meta: { sortable: true },
    cell: ({ row }) => formatMoney(row.original.salePrice ?? row.original.price),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { sortable: true },
    cell: ({ row }) => <StatusChip domain="product" status={row.original.status} />,
  },
  { accessorKey: 'stockQty', header: 'Stock', meta: { sortable: true } },
]

export function SellerProductsListPage(props: ProductsSearch) {
  const { page, pageSize, search, status, sort } = props
  const navigate = useNavigate()
  const { patch, onSortChange } = useListSearch('/seller/products', props)
  const { data: me } = useQuery<SessionUser | null>({ queryKey: ME_QUERY_KEY })

  const { data, isLoading } = useQuery({
    queryKey: ['seller-products', me?.sellerId, { page, pageSize, search, status, sort }],
    queryFn: () =>
      products.listProducts({ page, pageSize, search, status, sort, sellerId: me!.sellerId! }),
    enabled: !!me?.sellerId,
    placeholderData: (prev) => prev,
  })

  return (
    <div>
      <PageHeader
        title="Products"
        description="Your catalog"
        actions={
          <Button asChild>
            <Link to="/seller/products/new">Create product</Link>
          </Button>
        }
      />
      <FilterBar
        search={search}
        onSearchChange={(s) => patch({ search: s || undefined }, true)}
        status={status}
        onStatusChange={(s) => patch({ status: s }, true)}
        statusOptions={statusOptions}
      />
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        sort={sort}
        onSortChange={onSortChange}
        onRowClick={(row) =>
          void navigate({ to: '/seller/products/$productId', params: { productId: row.id } })
        }
      />
      {data && (
        <ListPagination
          page={page}
          pageSize={pageSize}
          total={data.total}
          onPageChange={(p) => patch({ page: p })}
        />
      )}
    </div>
  )
}
