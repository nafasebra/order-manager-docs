import { Outlet, useNavigate, useRouter } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { LayoutDashboard, Package, ShoppingCart, Settings } from 'lucide-react'
import { AppShell } from './AppShell'
import type { NavSection } from './SidebarNav'
import { auth } from '@/lib/api'
import { ME_QUERY_KEY } from '@/lib/router/context'
import { syncRouterSession } from '@/lib/router/session'

const sellerSections: NavSection[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', to: '/seller', icon: LayoutDashboard, exact: true }],
  },
  {
    label: 'Shop',
    items: [
      { label: 'Products', to: '/seller/products', icon: Package },
      { label: 'Orders', to: '/seller/orders', icon: ShoppingCart },
    ],
  },
  {
    label: 'Settings',
    items: [{ label: 'Settings', to: '/seller/settings', icon: Settings }],
  },
]

export function SellerShellLayout() {
  const navigate = useNavigate()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: me } = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: () => auth.getMe(),
  })

  if (!me || me.actorType !== 'seller') return null

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
      panel="seller"
      panelLabel={me.name}
      sections={sellerSections}
      user={me}
      onLogout={() => void handleLogout()}
    >
      <Outlet />
    </AppShell>
  )
}
