import { template } from "@/config/template";
const defaultCurrency = template.currency;
const defaultLocale = template.locale;
const defaultTimeZone = template.timeZone;

export function formatMoney(
  amount: number,
  currency: string = defaultCurrency,
  locale: string = defaultLocale,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  },
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(defaultLocale, {
    ...options,
    timeZone: defaultTimeZone,
  }).format(date);
}

export function formatRelative(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60_000);
  const rtf = new Intl.RelativeTimeFormat(defaultLocale, { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute");
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour");
  }
  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, "day");
}

export function formatId(id: string): string {
  return id;
}
