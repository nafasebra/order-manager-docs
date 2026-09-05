import { Outlet, useNavigate, useRouter } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Home, User, MapPin, ShoppingCart, LifeBuoy } from 'lucide-react'
import { AppShell } from './AppShell'
import type { NavSection } from './SidebarNav'
import { auth } from '@/lib/api'
import { ME_QUERY_KEY } from '@/lib/router/context'
import { syncRouterSession } from '@/lib/router/session'

const buyerSections: NavSection[] = [
  {
    items: [
      { label: 'Home', to: '/account', icon: Home, exact: true },
      { label: 'Profile', to: '/account/profile', icon: User },
      { label: 'Addresses', to: '/account/addresses', icon: MapPin },
      { label: 'Orders', to: '/account/orders', icon: ShoppingCart },
      { label: 'Tickets', to: '/account/tickets', icon: LifeBuoy },
    ],
  },
]

export function BuyerShellLayout() {
  const navigate = useNavigate()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: me } = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: () => auth.getMe(),
  })

  if (!me || me.actorType !== 'buyer') return null

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
      panel="buyer"
      panelLabel="My Account"
      sections={buyerSections}
      user={me}
      onLogout={() => void handleLogout()}
    >
      <Outlet />
    </AppShell>
  )
}
