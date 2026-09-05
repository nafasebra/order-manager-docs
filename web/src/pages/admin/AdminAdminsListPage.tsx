import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader, FilterBar, DataTable, ListPagination } from '@/components/patterns'
import { admins } from '@/lib/api'
import { useListSearch } from '@/lib/router/useListSearch'
import type { AdminsSearch } from '@/lib/router/searchSchemas'
import type { AdminUser } from '@/types'
import { Badge } from '@/components/ui/badge'

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
]

const columns: ColumnDef<AdminUser>[] = [
  { accessorKey: 'name', header: 'Name', meta: { sortable: true } },
  { accessorKey: 'email', header: 'Email', meta: { sortable: true } },
  {
    accessorKey: 'isSuperuser',
    header: 'Role',
    cell: ({ row }) =>
      row.original.isSuperuser ? (
        <Badge>Superuser</Badge>
      ) : (
        <Badge variant="secondary">{row.original.roleTemplateId ?? 'Custom'}</Badge>
      ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { sortable: true },
    cell: ({ row }) => (
      <Badge variant={row.original.status === 'active' ? 'secondary' : 'destructive'}>
        {row.original.status}
      </Badge>
    ),
  },
]

export function AdminAdminsListPage(props: AdminsSearch) {
  const { page, pageSize, search, status, sort } = props
  const navigate = useNavigate()
  const { patch, onSortChange } = useListSearch('/admin/settings/admins', props)

  const { data, isLoading } = useQuery({
    queryKey: ['admins', { page, pageSize, search, status, sort }],
    queryFn: () => admins.listAdmins({ page, pageSize, search, status, sort }),
    placeholderData: (prev) => prev,
  })

  return (
    <div>
      <PageHeader title="Admin users" description="Staff accounts and permissions (superuser)" />
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
          void navigate({
            to: '/admin/settings/admins/$adminId',
            params: { adminId: row.id },
          })
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
