import {
  createRootRouteWithContext,
  createRoute,
  redirect,
  Outlet,
} from '@tanstack/react-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { AdminShellLayout } from '@/components/shells/AdminShell'
import { SellerShellLayout } from '@/components/shells/SellerShell'
import { BuyerShellLayout } from '@/components/shells/BuyerShell'
import {
  LoginPage,
  SessionExpiredPage,
  ForbiddenPage,
  NotFoundPage,
} from '@/pages/auth/AuthPages'
import { AdminOverviewPage } from '@/pages/admin/AdminOverviewPage'
import { AdminOrdersListPage } from '@/pages/admin/AdminOrdersListPage'
import { AdminOrderDetailPage } from '@/pages/admin/AdminOrderDetailPage'
import { AdminBuyersListPage } from '@/pages/admin/AdminBuyersListPage'
import { AdminBuyerDetailPage } from '@/pages/admin/AdminBuyerDetailPage'
import { AdminSellersListPage } from '@/pages/admin/AdminSellersListPage'
import { AdminSellerDetailPage } from '@/pages/admin/AdminSellerDetailPage'
import { AdminProductsListPage } from '@/pages/admin/AdminProductsListPage'
import { AdminProductDetailPage } from '@/pages/admin/AdminProductDetailPage'
import { AdminTicketsListPage } from '@/pages/admin/AdminTicketsListPage'
import { AdminTicketDetailPage } from '@/pages/admin/AdminTicketDetailPage'
import { AdminAdminsListPage } from '@/pages/admin/AdminAdminsListPage'
import { AdminAdminDetailPage } from '@/pages/admin/AdminAdminDetailPage'
import { SellerOverviewPage } from '@/pages/seller/SellerOverviewPage'
import { SellerProductsListPage } from '@/pages/seller/SellerProductsListPage'
import { SellerProductDetailPage } from '@/pages/seller/SellerProductDetailPage'
import { SellerProductFormPage } from '@/pages/seller/SellerProductFormPage'
import { SellerOrdersListPage } from '@/pages/seller/SellerOrdersListPage'
import { SellerOrderDetailPage } from '@/pages/seller/SellerOrderDetailPage'
import { SellerSettingsPage } from '@/pages/seller/SellerSettingsPage'
import { BuyerHomePage } from '@/pages/buyer/BuyerHomePage'
import { BuyerProfilePage } from '@/pages/buyer/BuyerProfilePage'
import { BuyerAddressesPage } from '@/pages/buyer/BuyerAddressesPage'
import { BuyerOrdersListPage } from '@/pages/buyer/BuyerOrdersListPage'
import { BuyerOrderDetailPage } from '@/pages/buyer/BuyerOrderDetailPage'
import { BuyerTicketsListPage } from '@/pages/buyer/BuyerTicketsListPage'
import { BuyerTicketDetailPage } from '@/pages/buyer/BuyerTicketDetailPage'
import type { RouterContext } from '@/lib/router/context'
import {
  requireStaffSession,
  requireSellerSession,
  requireBuyerSession,
  requireGrant,
  redirectIfAuthenticated,
} from '@/lib/router/guards'
import { getSessionUser } from '@/lib/router/session'
import {
  buyersSearchSchema,
  sellersSearchSchema,
  ordersSearchSchema,
  productsSearchSchema,
  ticketsSearchSchema,
  adminsSearchSchema,
} from '@/lib/router/searchSchemas'

function RootComponent() {
  return (
    <TooltipProvider>
      <Outlet />
      <Toaster />
    </TooltipProvider>
  )
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFoundPage,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: ({ context }) => {
    const me = getSessionUser(context)
    if (!me) throw redirect({ to: '/auth/login' })
    if (me.actorType === 'admin') throw redirect({ to: '/admin' })
    if (me.actorType === 'seller') throw redirect({ to: '/seller' })
    throw redirect({ to: '/account' })
  },
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/login',
  beforeLoad: redirectIfAuthenticated,
  component: LoginPage,
})

const sessionExpiredRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/session-expired',
  component: SessionExpiredPage,
})

const forbiddenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/403',
  component: ForbiddenPage,
})

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  beforeLoad: requireStaffSession,
  component: AdminShellLayout,
})

const adminIndexRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/',
  component: AdminOverviewPage,
})

const adminOrdersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/orders',
  validateSearch: ordersSearchSchema,
  beforeLoad: ({ context }) => requireGrant(context, 'orders'),
  component: function AdminOrders() {
    const search = adminOrdersRoute.useSearch()
    return <AdminOrdersListPage {...search} />
  },
})

const adminOrderDetailRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/orders/$orderId',
  beforeLoad: ({ context }) => requireGrant(context, 'orders'),
  component: function AdminOrderDetail() {
    const { orderId } = adminOrderDetailRoute.useParams()
    return <AdminOrderDetailPage orderId={orderId} />
  },
})

const adminBuyersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/buyers',
  validateSearch: buyersSearchSchema,
  beforeLoad: ({ context }) => requireGrant(context, 'buyers'),
  component: function AdminBuyers() {
    const search = adminBuyersRoute.useSearch()
    return <AdminBuyersListPage {...search} />
  },
})

const adminBuyerDetailRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/buyers/$buyerId',
  beforeLoad: ({ context }) => requireGrant(context, 'buyers'),
  component: function AdminBuyerDetail() {
    const { buyerId } = adminBuyerDetailRoute.useParams()
    return <AdminBuyerDetailPage buyerId={buyerId} />
  },
})

const adminSellersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/sellers',
  validateSearch: sellersSearchSchema,
  beforeLoad: ({ context }) => requireGrant(context, 'sellers'),
  component: function AdminSellers() {
    const search = adminSellersRoute.useSearch()
    return <AdminSellersListPage {...search} />
  },
})

const adminSellerDetailRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/sellers/$sellerId',
  beforeLoad: ({ context }) => requireGrant(context, 'sellers'),
  component: function AdminSellerDetail() {
    const { sellerId } = adminSellerDetailRoute.useParams()
    return <AdminSellerDetailPage sellerId={sellerId} />
  },
})

const adminProductsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/products',
  validateSearch: productsSearchSchema,
  beforeLoad: ({ context }) => requireGrant(context, 'products'),
  component: function AdminProducts() {
    const search = adminProductsRoute.useSearch()
    return <AdminProductsListPage {...search} />
  },
})

const adminProductDetailRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/products/$productId',
  beforeLoad: ({ context }) => requireGrant(context, 'products'),
  component: function AdminProductDetail() {
    const { productId } = adminProductDetailRoute.useParams()
    return <AdminProductDetailPage productId={productId} />
  },
})

const adminTicketsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/support/tickets',
  validateSearch: ticketsSearchSchema,
  beforeLoad: ({ context }) => requireGrant(context, 'tickets'),
  component: function AdminTickets() {
    const search = adminTicketsRoute.useSearch()
    return <AdminTicketsListPage {...search} />
  },
})

const adminTicketDetailRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/support/tickets/$ticketId',
  beforeLoad: ({ context }) => requireGrant(context, 'tickets'),
  component: function AdminTicketDetail() {
    const { ticketId } = adminTicketDetailRoute.useParams()
    return <AdminTicketDetailPage ticketId={ticketId} />
  },
})

const adminAdminsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/settings/admins',
  validateSearch: adminsSearchSchema,
  beforeLoad: ({ context }) => requireGrant(context, 'admin_management'),
  component: function AdminAdmins() {
    const search = adminAdminsRoute.useSearch()
    return <AdminAdminsListPage {...search} />
  },
})

const adminAdminDetailRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/settings/admins/$adminId',
  beforeLoad: ({ context }) => requireGrant(context, 'admin_management'),
  component: function AdminAdminDetail() {
    const { adminId } = adminAdminDetailRoute.useParams()
    return <AdminAdminDetailPage adminId={adminId} />
  },
})

const sellerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/seller',
  beforeLoad: requireSellerSession,
  component: SellerShellLayout,
})

const sellerIndexRoute = createRoute({
  getParentRoute: () => sellerRoute,
  path: '/',
  component: SellerOverviewPage,
})

const sellerProductsRoute = createRoute({
  getParentRoute: () => sellerRoute,
  path: '/products',
  validateSearch: productsSearchSchema,
  component: function SellerProducts() {
    const search = sellerProductsRoute.useSearch()
    return <SellerProductsListPage {...search} />
  },
})

const sellerProductNewRoute = createRoute({
  getParentRoute: () => sellerRoute,
  path: '/products/new',
  component: () => <SellerProductFormPage />,
})

const sellerProductDetailRoute = createRoute({
  getParentRoute: () => sellerRoute,
  path: '/products/$productId',
  component: function SellerProductDetail() {
    const { productId } = sellerProductDetailRoute.useParams()
    return <SellerProductDetailPage productId={productId} />
  },
})

const sellerProductEditRoute = createRoute({
  getParentRoute: () => sellerRoute,
  path: '/products/$productId/edit',
  component: function SellerProductEdit() {
    const { productId } = sellerProductEditRoute.useParams()
    return <SellerProductFormPage productId={productId} />
  },
})

const sellerOrdersRoute = createRoute({
  getParentRoute: () => sellerRoute,
  path: '/orders',
  validateSearch: ordersSearchSchema,
  component: function SellerOrders() {
    const search = sellerOrdersRoute.useSearch()
    return <SellerOrdersListPage {...search} />
  },
})

const sellerOrderDetailRoute = createRoute({
  getParentRoute: () => sellerRoute,
  path: '/orders/$orderId',
  component: function SellerOrderDetail() {
    const { orderId } = sellerOrderDetailRoute.useParams()
    return <SellerOrderDetailPage orderId={orderId} />
  },
})

const sellerSettingsRoute = createRoute({
  getParentRoute: () => sellerRoute,
  path: '/settings',
  component: SellerSettingsPage,
})

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account',
  beforeLoad: requireBuyerSession,
  component: BuyerShellLayout,
})

const accountIndexRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/',
  component: BuyerHomePage,
})

const accountProfileRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/profile',
  component: BuyerProfilePage,
})

const accountAddressesRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/addresses',
  component: BuyerAddressesPage,
})

const accountOrdersRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/orders',
  validateSearch: ordersSearchSchema,
  component: function BuyerOrders() {
    const search = accountOrdersRoute.useSearch()
    return <BuyerOrdersListPage {...search} />
  },
})

const accountOrderDetailRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/orders/$orderId',
  component: function BuyerOrderDetail() {
    const { orderId } = accountOrderDetailRoute.useParams()
    return <BuyerOrderDetailPage orderId={orderId} />
  },
})

const accountTicketsRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/tickets',
  validateSearch: ticketsSearchSchema,
  component: function BuyerTickets() {
    const search = accountTicketsRoute.useSearch()
    return <BuyerTicketsListPage {...search} />
  },
})

const accountTicketDetailRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/tickets/$ticketId',
  component: function BuyerTicketDetail() {
    const { ticketId } = accountTicketDetailRoute.useParams()
    return <BuyerTicketDetailPage ticketId={ticketId} />
  },
})

export const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  sessionExpiredRoute,
  forbiddenRoute,
  adminRoute.addChildren([
    adminIndexRoute,
    adminOrdersRoute,
    adminOrderDetailRoute,
    adminBuyersRoute,
    adminBuyerDetailRoute,
    adminSellersRoute,
    adminSellerDetailRoute,
    adminProductsRoute,
    adminProductDetailRoute,
    adminTicketsRoute,
    adminTicketDetailRoute,
    adminAdminsRoute,
    adminAdminDetailRoute,
  ]),
  sellerRoute.addChildren([
    sellerIndexRoute,
    sellerProductsRoute,
    sellerProductNewRoute,
    sellerProductDetailRoute,
    sellerProductEditRoute,
    sellerOrdersRoute,
    sellerOrderDetailRoute,
    sellerSettingsRoute,
  ]),
  accountRoute.addChildren([
    accountIndexRoute,
    accountProfileRoute,
    accountAddressesRoute,
    accountOrdersRoute,
    accountOrderDetailRoute,
    accountTicketsRoute,
    accountTicketDetailRoute,
  ]),
])
