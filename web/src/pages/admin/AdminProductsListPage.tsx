import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader, FilterBar, DataTable, ListPagination } from '@/components/patterns'
import { StatusChip } from '@/components/patterns/StatusChip'
import { products } from '@/lib/api'
import { useListSearch } from '@/lib/router/useListSearch'
import type { ProductsSearch } from '@/lib/router/searchSchemas'
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
  { accessorKey: 'sellerName', header: 'Seller', meta: { sortable: true } },
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

export function AdminProductsListPage(props: ProductsSearch) {
  const { page, pageSize, search, status, sort } = props
  const navigate = useNavigate()
  const { patch, onSortChange } = useListSearch('/admin/products', props)

  const { data, isLoading } = useQuery({
    queryKey: ['products', { page, pageSize, search, status, sort }],
    queryFn: () => products.listProducts({ page, pageSize, search, status, sort }),
    placeholderData: (prev) => prev,
  })

  return (
    <div>
      <PageHeader title="Products" description="Platform catalog" />
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
        dense
        sort={sort}
        onSortChange={onSortChange}
        onRowClick={(row) =>
          void navigate({ to: '/admin/products/$productId', params: { productId: row.id } })
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
