import { Outlet, useNavigate, useRouter } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Store,
  Package,
  LifeBuoy,
  Settings,
} from 'lucide-react'
import { AppShell } from './AppShell'
import type { NavSection } from './SidebarNav'
import { hasView } from '@/lib/permissions'
import { auth } from '@/lib/api'
import { ME_QUERY_KEY } from '@/lib/router/context'
import { syncRouterSession } from '@/lib/router/session'
import type { PermissionArea, PermissionGrant } from '@/types'

function buildAdminNav(grants: PermissionGrant[] | undefined, isSuperuser: boolean): NavSection[] {
  const canView = (area: PermissionArea) => hasView(grants, isSuperuser, area)
  const sections: NavSection[] = []

  const overview: NavSection = {
    label: 'Overview',
    items: [{ label: 'Dashboard', to: '/admin', icon: LayoutDashboard, exact: true }],
  }
  sections.push(overview)

  const commerceItems = []
  if (canView('orders')) commerceItems.push({ label: 'Orders', to: '/admin/orders', icon: ShoppingCart })
  if (commerceItems.length) sections.push({ label: 'Commerce', items: commerceItems })

  const peopleItems = []
  if (canView('buyers')) peopleItems.push({ label: 'Buyers', to: '/admin/buyers', icon: Users })
  if (canView('sellers')) peopleItems.push({ label: 'Sellers', to: '/admin/sellers', icon: Store })
  if (peopleItems.length) sections.push({ label: 'People', items: peopleItems })

  if (canView('products')) {
    sections.push({
      label: 'Catalog',
      items: [{ label: 'Products', to: '/admin/products', icon: Package }],
    })
  }

  if (canView('tickets')) {
    sections.push({
      label: 'Support',
      items: [{ label: 'Tickets', to: '/admin/support/tickets', icon: LifeBuoy }],
    })
  }

  if (isSuperuser || canView('admin_management')) {
    sections.push({
      label: 'Settings',
      items: [{ label: 'Admins', to: '/admin/settings/admins', icon: Settings }],
    })
  }

  return sections
}

export function AdminShellLayout() {
  const navigate = useNavigate()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: me } = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: () => auth.getMe(),
  })

  if (!me || me.actorType !== 'admin') return null

  const sections = buildAdminNav(me.grants, me.isSuperuser ?? false)

  const handleLogout = async () => {
    await auth.logout()
    router.update({
      context: syncRouterSession(
        { queryClient, me: router.options.context.me },
        null,
      ),
    })
    await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY })
    void navigate({ to: '/auth/login' })
  }

  return (
    <AppShell
      panel="admin"
      panelLabel="Clean Commerce"
      sections={sections}
      user={me}
      onLogout={() => void handleLogout()}
    >
      <Outlet />
    </AppShell>
  )
}
