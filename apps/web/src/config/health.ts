import { template } from "./template";
export type HealthSettings = { lowStock: number; staleDays: number };
export const healthSettingsKey = "clean-commerce:health-settings";
export const defaultHealthSettings: HealthSettings = {
  lowStock: template.lowStock,
  staleDays: 30,
};
export function readHealthSettings(): HealthSettings {
  try {
    const value = JSON.parse(localStorage.getItem(healthSettingsKey) ?? "null");
    if (
      Number.isSafeInteger(value?.lowStock) &&
      value.lowStock >= 0 &&
      value.lowStock <= 10000 &&
      Number.isSafeInteger(value?.staleDays) &&
      value.staleDays >= 1 &&
      value.staleDays <= 365
    )
      return value;
  } catch {
    /* Defaults work without browser storage. */
  }
  return defaultHealthSettings;
}
