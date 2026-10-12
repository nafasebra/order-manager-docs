/** Central defaults for the reusable dashboard. */
export const template = {
  brand: "mintcommerce",
  currency: "GBP",
  locale: "en-GB",
  timeZone: "UTC",
  lowStock: 10,
  demo: import.meta.env.VITE_DEMO_MODE !== "false",
  apiBase: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  modules: { marketing: true, coupons: true, health: true, content: true },
} as const;
