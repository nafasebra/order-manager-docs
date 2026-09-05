import { useQuery } from '@tanstack/react-query'
import { PageHeader, DescriptionList } from '@/components/patterns'
import { admins } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AdminAdminDetailPageProps {
  adminId: string
}

const ALL_AREAS = [
  'analytics', 'marketing', 'crm', 'orders', 'buyers', 'sellers',
  'invoices', 'transactions', 'products', 'reviews', 'qa',
  'product_reports', 'website', 'blog', 'tickets', 'admin_management',
] as const

export function AdminAdminDetailPage({ adminId }: AdminAdminDetailPageProps) {
  const { data: admin } = useQuery({
    queryKey: ['admin', adminId],
    queryFn: () => admins.getAdmin(adminId),
  })
  const { data: grants } = useQuery({
    queryKey: ['admin-grants', adminId],
    queryFn: () => admins.getAdminGrants(adminId),
  })

  if (!admin) return <div className="text-muted-foreground">Loading…</div>

  return (
    <div>
      <PageHeader
        title={admin.name}
        description={admin.email}
        actions={
          admin.isSuperuser ? <Badge>Superuser</Badge> : <Badge variant="secondary">Staff</Badge>
        }
      />
      <DescriptionList
        className="mb-6"
        items={[
          { label: 'Username', value: admin.username },
          { label: 'Status', value: admin.status },
          { label: 'Role template', value: admin.roleTemplateId ?? 'Custom' },
        ]}
      />
      {!admin.isSuperuser && (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">Permission matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4">Area</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ALL_AREAS.map((area) => {
                    const grant = grants?.find((g) => g.area === area)
                    return (
                      <tr key={area} className="border-b">
                        <td className="py-2 pr-4 font-medium capitalize">{area.replace('_', ' ')}</td>
                        <td className="py-2 text-muted-foreground">
                          {grant?.actions.join(', ') ?? '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
