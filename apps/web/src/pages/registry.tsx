import { lazy } from "react";

export const LoginPage = lazy(() =>
  import("@/pages/auth/LoginPage").then((module) => ({
    default: module.LoginPage,
  })),
);

export const RoleSelectPage = lazy(() =>
  import("@/pages/auth/RoleSelectPage").then((module) => ({
    default: module.RoleSelectPage,
  })),
);

export const SessionExpiredPage = lazy(() =>
  import("@/pages/auth/SessionExpiredPage").then((module) => ({
    default: module.SessionExpiredPage,
  })),
);

export const ForbiddenPage = lazy(() =>
  import("@/pages/system/ErrorPages").then((module) => ({
    default: module.ForbiddenPage,
  })),
);

export const NotFoundPage = lazy(() =>
  import("@/pages/system/ErrorPages").then((module) => ({
    default: module.NotFoundPage,
  })),
);

export const AdminOverviewPage = lazy(() =>
  import("@/pages/admin/AdminOverviewPage").then((module) => ({
    default: module.AdminOverviewPage,
  })),
);

export const AdminHealthCenterPage = lazy(() =>
  import("@/pages/admin/AdminHealthCenterPage").then((module) => ({
    default: module.AdminHealthCenterPage,
  })),
);

export const SellerTicketsListPage = lazy(() =>
  import("@/pages/seller/SellerTicketPages").then((module) => ({
    default: module.SellerTicketsListPage,
  })),
);

export const SellerTicketDetailPage = lazy(() =>
  import("@/pages/seller/SellerTicketPages").then((module) => ({
    default: module.SellerTicketDetailPage,
  })),
);

export const SellerInventoryPage = lazy(() =>
  import("@/pages/seller/SellerInventoryPage").then((module) => ({
    default: module.SellerInventoryPage,
  })),
);

export const SellerCouponsPage = lazy(() =>
  import("@/pages/seller/SellerCouponsPage").then((module) => ({
    default: module.SellerCouponsPage,
  })),
);

export const AdminCouponsPage = lazy(() =>
  import("@/pages/admin/AdminCouponsPage").then((module) => ({
    default: module.AdminCouponsPage,
  })),
);

export const SellerProductsPage = lazy(() =>
  import("@/pages/seller/SellerProductsPage").then((module) => ({
    default: module.SellerProductsPage,
  })),
);

export const AdminAnalyticsPage = lazy(() =>
  import("@/pages/admin/AdminAnalyticsPage").then((module) => ({
    default: module.AdminAnalyticsPage,
  })),
);

export const AdminOrdersListPage = lazy(() =>
  import("@/pages/admin/AdminOrdersListPage").then((module) => ({
    default: module.AdminOrdersListPage,
  })),
);

export const AdminOrderDetailPage = lazy(() =>
  import("@/pages/admin/AdminOrderDetailPage").then((module) => ({
    default: module.AdminOrderDetailPage,
  })),
);

export const AdminBuyerDetailPage = lazy(() =>
  import("@/pages/admin/AdminPeoplePages").then((module) => ({
    default: module.AdminBuyerDetailPage,
  })),
);

export const AdminBuyersListPage = lazy(() =>
  import("@/pages/admin/AdminPeoplePages").then((module) => ({
    default: module.AdminBuyersListPage,
  })),
);

export const AdminSellerCreatePage = lazy(() =>
  import("@/pages/admin/AdminPeoplePages").then((module) => ({
    default: module.AdminSellerCreatePage,
  })),
);

export const AdminSellerDetailPage = lazy(() =>
  import("@/pages/admin/AdminPeoplePages").then((module) => ({
    default: module.AdminSellerDetailPage,
  })),
);

export const AdminSellersListPage = lazy(() =>
  import("@/pages/admin/AdminPeoplePages").then((module) => ({
    default: module.AdminSellersListPage,
  })),
);

export const AdminCategoryFormPage = lazy(() =>
  import("@/pages/admin/AdminCatalogPages").then((module) => ({
    default: module.AdminCategoryFormPage,
  })),
);

export const AdminCategoriesListPage = lazy(() =>
  import("@/pages/admin/AdminCatalogPages").then((module) => ({
    default: module.AdminCategoriesListPage,
  })),
);

export const AdminProductDetailPage = lazy(() =>
  import("@/pages/admin/AdminCatalogPages").then((module) => ({
    default: module.AdminProductDetailPage,
  })),
);

export const AdminProductsListPage = lazy(() =>
  import("@/pages/admin/AdminCatalogPages").then((module) => ({
    default: module.AdminProductsListPage,
  })),
);

export const AdminQuestionDetailPage = lazy(() =>
  import("@/pages/admin/AdminCatalogPages").then((module) => ({
    default: module.AdminQuestionDetailPage,
  })),
);

export const AdminQuestionsListPage = lazy(() =>
  import("@/pages/admin/AdminCatalogPages").then((module) => ({
    default: module.AdminQuestionsListPage,
  })),
);

export const AdminReportDetailPage = lazy(() =>
  import("@/pages/admin/AdminCatalogPages").then((module) => ({
    default: module.AdminReportDetailPage,
  })),
);

export const AdminReportsListPage = lazy(() =>
  import("@/pages/admin/AdminCatalogPages").then((module) => ({
    default: module.AdminReportsListPage,
  })),
);

export const AdminReviewDetailPage = lazy(() =>
  import("@/pages/admin/AdminCatalogPages").then((module) => ({
    default: module.AdminReviewDetailPage,
  })),
);

export const AdminReviewsListPage = lazy(() =>
  import("@/pages/admin/AdminCatalogPages").then((module) => ({
    default: module.AdminReviewsListPage,
  })),
);

export const AdminInvoiceCreatePage = lazy(() =>
  import("@/pages/admin/AdminInvoicePages").then((module) => ({
    default: module.AdminInvoiceCreatePage,
  })),
);

export const AdminInvoiceDetailPage = lazy(() =>
  import("@/pages/admin/AdminInvoicePages").then((module) => ({
    default: module.AdminInvoiceDetailPage,
  })),
);

export const AdminInvoicesListPage = lazy(() =>
  import("@/pages/admin/AdminInvoicePages").then((module) => ({
    default: module.AdminInvoicesListPage,
  })),
);

export const AdminTransactionDetailPage = lazy(() =>
  import("@/pages/admin/AdminTransactionPages").then((module) => ({
    default: module.AdminTransactionDetailPage,
  })),
);

export const AdminTransactionsListPage = lazy(() =>
  import("@/pages/admin/AdminTransactionPages").then((module) => ({
    default: module.AdminTransactionsListPage,
  })),
);

export const AdminBlogDetailPage = lazy(() =>
  import("@/pages/admin/AdminContentPages").then((module) => ({
    default: module.AdminBlogDetailPage,
  })),
);

export const AdminBlogEditorPage = lazy(() =>
  import("@/pages/admin/AdminContentPages").then((module) => ({
    default: module.AdminBlogEditorPage,
  })),
);

export const AdminBlogListPage = lazy(() =>
  import("@/pages/admin/AdminContentPages").then((module) => ({
    default: module.AdminBlogListPage,
  })),
);

export const AdminCrmDetailPage = lazy(() =>
  import("@/pages/admin/AdminContentPages").then((module) => ({
    default: module.AdminCrmDetailPage,
  })),
);

export const AdminCrmListPage = lazy(() =>
  import("@/pages/admin/AdminContentPages").then((module) => ({
    default: module.AdminCrmListPage,
  })),
);

export const AdminWebsitePage = lazy(() =>
  import("@/pages/admin/AdminContentPages").then((module) => ({
    default: module.AdminWebsitePage,
  })),
);

export const AdminWebsitePageEditor = lazy(() =>
  import("@/pages/admin/AdminContentPages").then((module) => ({
    default: module.AdminWebsitePageEditor,
  })),
);

export const AdminWebsitePagesListPage = lazy(() =>
  import("@/pages/admin/AdminContentPages").then((module) => ({
    default: module.AdminWebsitePagesListPage,
  })),
);

export const AdminCampaignCreatePage = lazy(() =>
  import("@/pages/admin/AdminCampaignPages").then((module) => ({
    default: module.AdminCampaignCreatePage,
  })),
);

export const AdminCampaignDetailPage = lazy(() =>
  import("@/pages/admin/AdminCampaignPages").then((module) => ({
    default: module.AdminCampaignDetailPage,
  })),
);

export const AdminMarketingListPage = lazy(() =>
  import("@/pages/admin/AdminCampaignPages").then((module) => ({
    default: module.AdminMarketingListPage,
  })),
);

export const AdminTicketDetailPage = lazy(() =>
  import("@/pages/admin/AdminTicketPages").then((module) => ({
    default: module.AdminTicketDetailPage,
  })),
);

export const AdminTicketsListPage = lazy(() =>
  import("@/pages/admin/AdminTicketPages").then((module) => ({
    default: module.AdminTicketsListPage,
  })),
);

export const AdminAdminCreatePage = lazy(() =>
  import("@/pages/admin/AdminSettingsPages").then((module) => ({
    default: module.AdminAdminCreatePage,
  })),
);

export const AdminAdminDetailPage = lazy(() =>
  import("@/pages/admin/AdminSettingsPages").then((module) => ({
    default: module.AdminAdminDetailPage,
  })),
);

export const AdminAdminsListPage = lazy(() =>
  import("@/pages/admin/AdminSettingsPages").then((module) => ({
    default: module.AdminAdminsListPage,
  })),
);

export const AdminRolesPage = lazy(() =>
  import("@/pages/admin/AdminSettingsPages").then((module) => ({
    default: module.AdminRolesPage,
  })),
);

export const SellerAnalyticsPage = lazy(() =>
  import("@/pages/seller/SellerPages").then((module) => ({
    default: module.SellerAnalyticsPage,
  })),
);

export const SellerOverviewPage = lazy(() =>
  import("@/pages/seller/SellerPages").then((module) => ({
    default: module.SellerOverviewPage,
  })),
);

export const SellerOrdersListPage = lazy(() =>
  import("@/pages/seller/SellerCommercePages").then((module) => ({
    default: module.SellerOrdersListPage,
  })),
);

export const SellerOrderDetailPage = lazy(() =>
  import("@/pages/seller/SellerCommercePages").then((module) => ({
    default: module.SellerOrderDetailPage,
  })),
);

export const SellerSettingsPage = lazy(() =>
  import("@/pages/seller/SellerCommercePages").then((module) => ({
    default: module.SellerSettingsPage,
  })),
);

export const BuyerAddressesPage = lazy(() =>
  import("@/pages/buyer/BuyerPages").then((module) => ({
    default: module.BuyerAddressesPage,
  })),
);

export const BuyerHomePage = lazy(() =>
  import("@/pages/buyer/BuyerPages").then((module) => ({
    default: module.BuyerHomePage,
  })),
);

export const BuyerOrderDetailPage = lazy(() =>
  import("@/pages/buyer/BuyerPages").then((module) => ({
    default: module.BuyerOrderDetailPage,
  })),
);

export const BuyerOrdersListPage = lazy(() =>
  import("@/pages/buyer/BuyerPages").then((module) => ({
    default: module.BuyerOrdersListPage,
  })),
);

export const BuyerProfilePage = lazy(() =>
  import("@/pages/buyer/BuyerPages").then((module) => ({
    default: module.BuyerProfilePage,
  })),
);

export const BuyerTicketDetailPage = lazy(() =>
  import("@/pages/buyer/BuyerPages").then((module) => ({
    default: module.BuyerTicketDetailPage,
  })),
);

export const BuyerTicketsListPage = lazy(() =>
  import("@/pages/buyer/BuyerPages").then((module) => ({
    default: module.BuyerTicketsListPage,
  })),
);
