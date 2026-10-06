import {
  Outlet,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  useNavigate,
} from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Toaster } from "@/components/ui/sonner";
import { TableSortProvider } from "@/components/patterns/TableSortProvider";
import { AdminShell } from "@/components/shells/AdminShell";
import { SellerShell } from "@/components/shells/SellerShell";
import { BuyerShell } from "@/components/shells/BuyerShell";
import {
  requireBuyerSession,
  requireGrant,
  requireSellerSession,
  requireStaffSession,
  type RouterContext,
} from "@/lib/router/guards";
import { listSearchSchema, ordersSearchSchema } from "@/lib/router/search";
import { can } from "@/lib/permissions/can";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RoleSelectPage } from "@/pages/auth/RoleSelectPage";
import { SessionExpiredPage } from "@/pages/auth/SessionExpiredPage";
import { ForbiddenPage, NotFoundPage } from "@/pages/system/ErrorPages";
import { AdminOverviewPage } from "@/pages/admin/AdminOverviewPage";
import { SellerTicketsListPage, SellerTicketDetailPage } from "@/pages/seller/SellerTicketPages";
import { SellerInventoryPage } from "@/pages/seller/SellerInventoryPage";
import { SellerCouponsPage } from "@/pages/seller/SellerCouponsPage";
import { AdminCouponsPage } from "@/pages/admin/AdminCouponsPage";
import { SellerProductsPage } from "@/pages/seller/SellerProductsPage";
import { AdminAnalyticsPage } from "@/pages/admin/AdminAnalyticsPage";
import { AdminOrdersListPage } from "@/pages/admin/AdminOrdersListPage";
import { AdminOrderDetailPage } from "@/pages/admin/AdminOrderDetailPage";
import {
  AdminBuyerDetailPage,
  AdminBuyersListPage,
  AdminSellerCreatePage,
  AdminSellerDetailPage,
  AdminSellersListPage,
} from "@/pages/admin/AdminPeoplePages";
import {
  AdminCategoryFormPage,
  AdminCategoriesListPage,
  AdminProductDetailPage,
  AdminProductsListPage,
  AdminQuestionDetailPage,
  AdminQuestionsListPage,
  AdminReportDetailPage,
  AdminReportsListPage,
  AdminReviewDetailPage,
  AdminReviewsListPage,
} from "@/pages/admin/AdminCatalogPages";
import {
  AdminInvoiceCreatePage,
  AdminInvoiceDetailPage,
  AdminInvoicesListPage,
} from "@/pages/admin/AdminInvoicePages";
import {
  AdminTransactionDetailPage,
  AdminTransactionsListPage,
} from "@/pages/admin/AdminTransactionPages";
import {
  AdminBlogDetailPage,
  AdminBlogEditorPage,
  AdminBlogListPage,
  AdminCrmDetailPage,
  AdminCrmListPage,
  AdminWebsitePage,
  AdminWebsitePageEditor,
  AdminWebsitePagesListPage,
} from "@/pages/admin/AdminContentPages";
import { AdminCampaignCreatePage, AdminCampaignDetailPage, AdminMarketingListPage } from "@/pages/admin/AdminCampaignPages";
import {
  AdminTicketDetailPage,
  AdminTicketsListPage,
} from "@/pages/admin/AdminTicketPages";
import {
  AdminAdminCreatePage,
  AdminAdminDetailPage,
  AdminAdminsListPage,
  AdminRolesPage,
} from "@/pages/admin/AdminSettingsPages";
import {
  SellerOrdersListPage,
  SellerAnalyticsPage,
  SellerOverviewPage,
  SellerSettingsPage,
} from "@/pages/seller/SellerPages";
import {
  BuyerAddressesPage,
  BuyerHomePage,
  BuyerOrderDetailPage,
  BuyerOrdersListPage,
  BuyerProfilePage,
  BuyerTicketDetailPage,
  BuyerTicketsListPage,
} from "@/pages/buyer/BuyerPages";
import type { ListParams, SessionUser } from "@/types";
import type { OrdersSearch } from "@/lib/router/search";

export type AppRouterContext = RouterContext & {
  queryClient: QueryClient;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

let sessionUser: SessionUser | null = null;

export function getSession(): SessionUser | null {
  return sessionUser;
}

export function setSession(user: SessionUser | null) {
  sessionUser = user;
}

function useListSearchSync<T extends ListParams>(
  route: { useSearch: () => T; fullPath: string },
) {
  const search = route.useSearch();
  const navigate = useNavigate({ from: route.fullPath as never });
  return {
    search,
    onSearchChange: (next: Partial<T>) => {
      void navigate({
        search: ((prev: T) => ({ ...prev, ...next })) as never,
      });
    },
  };
}

const rootRoute = createRootRouteWithContext<AppRouterContext>()({
  component: () => (
    <>
      <TableSortProvider><Outlet /></TableSortProvider>
      <Toaster />
    </>
  ),
  notFoundComponent: NotFoundPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: RoleSelectPage,
});

const authLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/login",
  validateSearch: z.object({
    panel: z.enum(["staff", "seller", "buyer"]).catch("staff"),
  }),
  component: function AuthLogin() {
    const { panel } = authLoginRoute.useSearch();
    return (
      <LoginPage
        defaultPanel={panel}
        onSession={(nextPanel) => {
          setSession({
            id: "local-1",
            displayName:
              nextPanel === "staff"
                ? "Nafas Admin"
                : nextPanel === "seller"
                  ? "Shop Owner"
                  : "Buyer",
            email: "demo@example.com",
            actorType: nextPanel,
            isSuperuser: nextPanel === "staff",
            shopName: nextPanel === "seller" ? "Demo Shop" : undefined,
            grants: [],
          });
        }}
      />
    );
  },
});

const authExpiredRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/session-expired",
  component: SessionExpiredPage,
});

const forbiddenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/403",
  component: ForbiddenPage,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/404",
  component: NotFoundPage,
});

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  beforeLoad: requireStaffSession,
  component: function AdminLayout() {
    return (
      <AdminShell
        user={getSession()}
        onLogout={() => {
          setSession(null);
          window.location.href = "/auth/login?panel=staff";
        }}
      >
        <Outlet />
      </AdminShell>
    );
  },
});

const adminIndexRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/",
  component: AdminOverviewPage,
});

const adminAnalyticsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/analytics",
  beforeLoad: ({ context }) => requireGrant(context, "analytics", "view"),
  component: AdminAnalyticsPage,
});

const adminMarketingRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/marketing",
  validateSearch: listSearchSchema.extend({
    status: z.enum(["draft", "scheduled", "active", "paused", "ended"]).optional(),
    tenant: z.string().optional(),
    channel: z.enum(["storefront", "email", "social"]).optional(),
  }),
  beforeLoad: ({ context }) => requireGrant(context, "marketing", "view"),
  component: function Page() {
    const { search, onSearchChange } = useListSearchSync(adminMarketingRoute);
    return (
      <AdminMarketingListPage search={search} onSearchChange={onSearchChange} />
    );
  },
});

const adminMarketingNewRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/marketing/new",
  beforeLoad: ({ context }) => requireGrant(context, "marketing", "create"),
  component: AdminCampaignCreatePage,
});

const adminMarketingDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/marketing/$campaignId",
  beforeLoad: ({ context }) => requireGrant(context, "marketing", "view"),
  component: function Page() {
    const { campaignId } = adminMarketingDetailRoute.useParams();
    return <AdminCampaignDetailPage campaignId={campaignId} />;
  },
});

const adminCrmRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/crm",
  validateSearch: listSearchSchema,
  beforeLoad: ({ context }) => requireGrant(context, "crm", "view"),
  component: function Page() {
    const { search, onSearchChange } = useListSearchSync(adminCrmRoute);
    return (
      <AdminCrmListPage search={search} onSearchChange={onSearchChange} />
    );
  },
});

const adminCrmDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/crm/$contactId",
  beforeLoad: ({ context }) => requireGrant(context, "crm", "view"),
  component: function Page() {
    const { contactId } = adminCrmDetailRoute.useParams();
    return <AdminCrmDetailPage contactId={contactId} />;
  },
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/orders",
  validateSearch: ordersSearchSchema,
  beforeLoad: ({ context }) => requireGrant(context, "orders", "view"),
  component: function Page() {
    const search = adminOrdersRoute.useSearch();
    const navigate = useNavigate({ from: adminOrdersRoute.fullPath });
    return (
      <AdminOrdersListPage
        search={search}
        onSearchChange={(next) =>
          void navigate({
            search: (prev: OrdersSearch) => ({ ...prev, ...next }),
          })
        }
      />
    );
  },
});

const adminOrderDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/orders/$orderId",
  beforeLoad: ({ context }) => requireGrant(context, "orders", "view"),
  component: function Page() {
    const { orderId } = adminOrderDetailRoute.useParams();
    return <AdminOrderDetailPage orderId={orderId} />;
  },
});

const adminInvoicesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/invoices",
  validateSearch: listSearchSchema,
  beforeLoad: ({ context }) => requireGrant(context, "invoices", "view"),
  component: function Page() {
    const { search, onSearchChange } = useListSearchSync(adminInvoicesRoute);
    return (
      <AdminInvoicesListPage search={search} onSearchChange={onSearchChange} />
    );
  },
});

const adminInvoiceNewRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/invoices/new",
  beforeLoad: ({ context }) => requireGrant(context, "invoices", "create"),
  component: AdminInvoiceCreatePage,
});

const adminInvoiceDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/invoices/$invoiceId",
  beforeLoad: ({ context }) => requireGrant(context, "invoices", "view"),
  component: function Page() {
    const { invoiceId } = adminInvoiceDetailRoute.useParams();
    return <AdminInvoiceDetailPage invoiceId={invoiceId} />;
  },
});

const adminTransactionsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/transactions",
  validateSearch: listSearchSchema,
  beforeLoad: ({ context }) => requireGrant(context, "transactions", "view"),
  component: function Page() {
    const { search, onSearchChange } =
      useListSearchSync(adminTransactionsRoute);
    return (
      <AdminTransactionsListPage
        search={search}
        onSearchChange={onSearchChange}
      />
    );
  },
});

const adminTransactionDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/transactions/$transactionId",
  beforeLoad: ({ context }) => requireGrant(context, "transactions", "view"),
  component: function Page() {
    const { transactionId } = adminTransactionDetailRoute.useParams();
    return <AdminTransactionDetailPage transactionId={transactionId} />;
  },
});

const adminBuyersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/buyers",
  validateSearch: listSearchSchema,
  beforeLoad: ({ context }) => requireGrant(context, "buyers", "view"),
  component: function Page() {
    const { search, onSearchChange } = useListSearchSync(adminBuyersRoute);
    return (
      <AdminBuyersListPage search={search} onSearchChange={onSearchChange} />
    );
  },
});

const adminBuyerDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/buyers/$buyerId",
  beforeLoad: ({ context }) => requireGrant(context, "buyers", "view"),
  component: function Page() {
    const { buyerId } = adminBuyerDetailRoute.useParams();
    return <AdminBuyerDetailPage buyerId={buyerId} />;
  },
});

const adminSellersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/sellers",
  validateSearch: listSearchSchema,
  beforeLoad: ({ context }) => requireGrant(context, "sellers", "view"),
  component: function Page() {
    const { search, onSearchChange } = useListSearchSync(adminSellersRoute);
    return (
      <AdminSellersListPage search={search} onSearchChange={onSearchChange} />
    );
  },
});

const adminSellerNewRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/sellers/new",
  beforeLoad: ({ context }) => requireGrant(context, "sellers", "create"),
  component: AdminSellerCreatePage,
});

const adminSellerDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/sellers/$sellerId",
  beforeLoad: ({ context }) => requireGrant(context, "sellers", "view"),
  component: function Page() {
    const { sellerId } = adminSellerDetailRoute.useParams();
    return <AdminSellerDetailPage sellerId={sellerId} />;
  },
});

const adminProductsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/products",
  validateSearch: listSearchSchema,
  beforeLoad: ({ context }) => requireGrant(context, "products", "view"),
  component: function Page() {
    const { search, onSearchChange } = useListSearchSync(adminProductsRoute);
    return (
      <AdminProductsListPage search={search} onSearchChange={onSearchChange} />
    );
  },
});

const adminCategoriesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/categories",
  validateSearch: listSearchSchema,
  beforeLoad: ({ context }) => requireGrant(context, "products", "view"),
  component: function Page() {
    const { search, onSearchChange } = useListSearchSync(adminCategoriesRoute);
    return (
      <AdminCategoriesListPage
        search={search}
        onSearchChange={onSearchChange}
      />
    );
  },
});

const adminCouponsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/coupons",
  beforeLoad: ({ context }) => requireGrant(context, "marketing", "view"),
  component: AdminCouponsPage,
});

const adminCategoryEditRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/categories/$categoryId/edit",
  beforeLoad: ({ context }) => requireGrant(context, "products", "edit"),
  component: function Page() {
    const { categoryId } = adminCategoryEditRoute.useParams();
    return <AdminCategoryFormPage categoryId={categoryId} />;
  },
});

const adminProductDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/products/$productId",
  beforeLoad: ({ context }) => requireGrant(context, "products", "view"),
  component: function Page() {
    const { productId } = adminProductDetailRoute.useParams();
    return <AdminProductDetailPage productId={productId} />;
  },
});

const adminReviewsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/reviews",
  validateSearch: listSearchSchema,
  beforeLoad: ({ context }) => requireGrant(context, "reviews", "view"),
  component: function Page() {
    const { search, onSearchChange } = useListSearchSync(adminReviewsRoute);
    return (
      <AdminReviewsListPage search={search} onSearchChange={onSearchChange} />
    );
  },
});

const adminReviewDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/reviews/$reviewId",
  beforeLoad: ({ context }) => requireGrant(context, "reviews", "view"),
  component: function Page() {
    const { reviewId } = adminReviewDetailRoute.useParams();
    return <AdminReviewDetailPage reviewId={reviewId} />;
  },
});

const adminQuestionsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/questions",
  validateSearch: listSearchSchema,
  beforeLoad: ({ context }) => requireGrant(context, "qa", "view"),
  component: function Page() {
    const { search, onSearchChange } = useListSearchSync(adminQuestionsRoute);
    return (
      <AdminQuestionsListPage search={search} onSearchChange={onSearchChange} />
    );
  },
});

const adminQuestionDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/questions/$questionId",
  beforeLoad: ({ context }) => requireGrant(context, "qa", "view"),
  component: function Page() {
    const { questionId } = adminQuestionDetailRoute.useParams();
    return <AdminQuestionDetailPage questionId={questionId} />;
  },
});

const adminReportsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/product-reports",
  validateSearch: listSearchSchema,
  beforeLoad: ({ context }) =>
    requireGrant(context, "product_reports", "view"),
  component: function Page() {
    const { search, onSearchChange } = useListSearchSync(adminReportsRoute);
    return (
      <AdminReportsListPage search={search} onSearchChange={onSearchChange} />
    );
  },
});

const adminReportDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/product-reports/$reportId",
  beforeLoad: ({ context }) =>
    requireGrant(context, "product_reports", "view"),
  component: function Page() {
    const { reportId } = adminReportDetailRoute.useParams();
    return <AdminReportDetailPage reportId={reportId} />;
  },
});

const adminWebsiteRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/website",
  beforeLoad: ({ context }) => requireGrant(context, "website", "view"),
  component: AdminWebsitePage,
});

const adminWebsitePagesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/website/pages",
  validateSearch: listSearchSchema,
  beforeLoad: ({ context }) => requireGrant(context, "website", "view"),
  component: function Page() {
    const { search, onSearchChange } =
      useListSearchSync(adminWebsitePagesRoute);
    return (
      <AdminWebsitePagesListPage
        search={search}
        onSearchChange={onSearchChange}
      />
    );
  },
});

const adminWebsitePageNewRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/website/pages/new",
  beforeLoad: ({ context }) => requireGrant(context, "website", "create"),
  component: function Page() {
    return <AdminWebsitePageEditor />;
  },
});

const adminWebsitePageDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/website/pages/$pageId",
  beforeLoad: ({ context }) => requireGrant(context, "website", "view"),
  component: function Page() {
    const { pageId } = adminWebsitePageDetailRoute.useParams();
    return <AdminWebsitePageEditor pageId={pageId} />;
  },
});

const adminBlogRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/blog",
  validateSearch: listSearchSchema,
  beforeLoad: ({ context }) => requireGrant(context, "blog", "view"),
  component: function Page() {
    const { search, onSearchChange } = useListSearchSync(adminBlogRoute);
    return (
      <AdminBlogListPage search={search} onSearchChange={onSearchChange} />
    );
  },
});

const adminBlogNewRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/blog/new",
  beforeLoad: ({ context }) => requireGrant(context, "blog", "create"),
  component: function Page() {
    return <AdminBlogEditorPage />;
  },
});

const adminBlogDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/blog/$postId",
  beforeLoad: ({ context }) => requireGrant(context, "blog", "view"),
  component: function Page() {
    const { postId } = adminBlogDetailRoute.useParams();
    return <AdminBlogDetailPage postId={postId} />;
  },
});

const adminBlogEditRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/blog/$postId/edit",
  beforeLoad: ({ context }) => requireGrant(context, "blog", "edit"),
  component: function Page() {
    const { postId } = adminBlogEditRoute.useParams();
    return <AdminBlogEditorPage postId={postId} />;
  },
});

const adminTicketsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/support/tickets",
  validateSearch: listSearchSchema,
  beforeLoad: ({ context }) => requireGrant(context, "tickets", "view"),
  component: function Page() {
    const { search, onSearchChange } = useListSearchSync(adminTicketsRoute);
    return (
      <AdminTicketsListPage search={search} onSearchChange={onSearchChange} />
    );
  },
});

const adminTicketDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/support/tickets/$ticketId",
  beforeLoad: ({ context }) => requireGrant(context, "tickets", "view"),
  component: function Page() {
    const { ticketId } = adminTicketDetailRoute.useParams();
    return <AdminTicketDetailPage ticketId={ticketId} />;
  },
});

const adminAdminsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/settings/admins",
  validateSearch: listSearchSchema,
  beforeLoad: ({ context }) =>
    requireGrant(context, "admin_management", "manage_admins"),
  component: function Page() {
    const { search, onSearchChange } = useListSearchSync(adminAdminsRoute);
    return (
      <AdminAdminsListPage search={search} onSearchChange={onSearchChange} />
    );
  },
});

const adminAdminNewRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/settings/admins/new",
  beforeLoad: ({ context }) =>
    requireGrant(context, "admin_management", "manage_admins"),
  component: AdminAdminCreatePage,
});

const adminAdminDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/settings/admins/$adminId",
  beforeLoad: ({ context }) =>
    requireGrant(context, "admin_management", "manage_admins"),
  component: function Page() {
    const { adminId } = adminAdminDetailRoute.useParams();
    return <AdminAdminDetailPage adminId={adminId} />;
  },
});

const adminRolesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/settings/roles",
  beforeLoad: ({ context }) =>
    requireGrant(context, "admin_management", "manage_admins"),
  component: AdminRolesPage,
});

const sellerLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/seller",
  beforeLoad: requireSellerSession,
  component: function SellerLayout() {
    return (
      <SellerShell
        user={getSession()}
        onLogout={() => {
          setSession(null);
          window.location.href = "/auth/login?panel=seller";
        }}
      >
        <Outlet />
      </SellerShell>
    );
  },
});

const sellerIndexRoute = createRoute({
  getParentRoute: () => sellerLayoutRoute,
  path: "/",
  component: SellerOverviewPage,
});

const sellerProductsRoute = createRoute({
  getParentRoute: () => sellerLayoutRoute,
  path: "/products",
  validateSearch: listSearchSchema,
  component: function Page() {
    const { search, onSearchChange } = useListSearchSync(sellerProductsRoute);
    return <SellerProductsPage search={search} onSearchChange={onSearchChange} />;
  },
});

const sellerAnalyticsRoute = createRoute({
  getParentRoute: () => sellerLayoutRoute,
  path: "/analytics",
  component: SellerAnalyticsPage,
});

const sellerInventoryRoute = createRoute({
  getParentRoute: () => sellerLayoutRoute,
  path: "/inventory",
  component: SellerInventoryPage,
});

const sellerCouponsRoute = createRoute({
  getParentRoute: () => sellerLayoutRoute,
  path: "/coupons",
  component: SellerCouponsPage,
});

const sellerOrdersRoute = createRoute({
  getParentRoute: () => sellerLayoutRoute,
  path: "/orders",
  validateSearch: ordersSearchSchema,
  component: SellerOrdersListPage,
});

const sellerSettingsRoute = createRoute({
  getParentRoute: () => sellerLayoutRoute,
  path: "/settings",
  component: SellerSettingsPage,
});

const sellerTicketsRoute = createRoute({
  getParentRoute: () => sellerLayoutRoute,
  path: "/tickets",
  validateSearch: listSearchSchema.extend({ status: z.enum(["open", "in_progress", "waiting", "resolved", "closed"]).optional() }),
  component: function Page() {
    const { search, onSearchChange } = useListSearchSync(sellerTicketsRoute);
    return <SellerTicketsListPage search={search} onSearchChange={onSearchChange} />;
  },
});

const sellerTicketDetailRoute = createRoute({
  getParentRoute: () => sellerLayoutRoute,
  path: "/tickets/$ticketId",
  component: function Page() {
    const { ticketId } = sellerTicketDetailRoute.useParams();
    return <SellerTicketDetailPage key={ticketId} ticketId={ticketId} />;
  },
});

const accountLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account",
  beforeLoad: requireBuyerSession,
  component: function AccountLayout() {
    return (
      <BuyerShell
        user={getSession()}
        onLogout={() => {
          setSession(null);
          window.location.href = "/auth/login?panel=buyer";
        }}
      >
        <Outlet />
      </BuyerShell>
    );
  },
});

const accountIndexRoute = createRoute({
  getParentRoute: () => accountLayoutRoute,
  path: "/",
  component: BuyerHomePage,
});

const accountProfileRoute = createRoute({
  getParentRoute: () => accountLayoutRoute,
  path: "/profile",
  component: BuyerProfilePage,
});

const accountAddressesRoute = createRoute({
  getParentRoute: () => accountLayoutRoute,
  path: "/addresses",
  component: BuyerAddressesPage,
});

const accountOrdersRoute = createRoute({
  getParentRoute: () => accountLayoutRoute,
  path: "/orders",
  validateSearch: ordersSearchSchema,
  component: function Page() {
    const { search, onSearchChange } = useListSearchSync(accountOrdersRoute);
    return (
      <BuyerOrdersListPage search={search} onSearchChange={onSearchChange} />
    );
  },
});

const accountOrderDetailRoute = createRoute({
  getParentRoute: () => accountLayoutRoute,
  path: "/orders/$orderId",
  component: function Page() {
    const { orderId } = accountOrderDetailRoute.useParams();
    return <BuyerOrderDetailPage orderId={orderId} />;
  },
});

const accountTicketsRoute = createRoute({
  getParentRoute: () => accountLayoutRoute,
  path: "/tickets",
  validateSearch: listSearchSchema,
  component: function Page() {
    const { search, onSearchChange } = useListSearchSync(accountTicketsRoute);
    return (
      <BuyerTicketsListPage search={search} onSearchChange={onSearchChange} />
    );
  },
});

const accountTicketDetailRoute = createRoute({
  getParentRoute: () => accountLayoutRoute,
  path: "/tickets/$ticketId",
  component: function Page() {
    const { ticketId } = accountTicketDetailRoute.useParams();
    return <BuyerTicketDetailPage ticketId={ticketId} />;
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  authLoginRoute,
  authExpiredRoute,
  forbiddenRoute,
  notFoundRoute,
  adminLayoutRoute.addChildren([
    adminIndexRoute,
    adminAnalyticsRoute,
    adminMarketingRoute,
    adminMarketingNewRoute,
    adminMarketingDetailRoute,
    adminCrmRoute,
    adminCrmDetailRoute,
    adminOrdersRoute,
    adminOrderDetailRoute,
    adminInvoicesRoute,
    adminInvoiceNewRoute,
    adminInvoiceDetailRoute,
    adminTransactionsRoute,
    adminTransactionDetailRoute,
    adminBuyersRoute,
    adminBuyerDetailRoute,
    adminSellersRoute,
    adminSellerNewRoute,
    adminSellerDetailRoute,
    adminProductsRoute,
    adminCategoriesRoute,
    adminCouponsRoute,
    adminCategoryEditRoute,
    adminProductDetailRoute,
    adminReviewsRoute,
    adminReviewDetailRoute,
    adminQuestionsRoute,
    adminQuestionDetailRoute,
    adminReportsRoute,
    adminReportDetailRoute,
    adminWebsiteRoute,
    adminWebsitePagesRoute,
    adminWebsitePageNewRoute,
    adminWebsitePageDetailRoute,
    adminBlogRoute,
    adminBlogNewRoute,
    adminBlogDetailRoute,
    adminBlogEditRoute,
    adminTicketsRoute,
    adminTicketDetailRoute,
    adminAdminsRoute,
    adminAdminNewRoute,
    adminAdminDetailRoute,
    adminRolesRoute,
  ]),
  sellerLayoutRoute.addChildren([
    sellerIndexRoute,
    sellerAnalyticsRoute,
    sellerInventoryRoute,
    sellerCouponsRoute,
    sellerProductsRoute,
    sellerOrdersRoute,
    sellerSettingsRoute,
    sellerTicketsRoute,
    sellerTicketDetailRoute,
  ]),
  accountLayoutRoute.addChildren([
    accountIndexRoute,
    accountProfileRoute,
    accountAddressesRoute,
    accountOrdersRoute,
    accountOrderDetailRoute,
    accountTicketsRoute,
    accountTicketDetailRoute,
  ]),
]);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
    getSession,
    can,
  },
  defaultPreload: "intent",
});
