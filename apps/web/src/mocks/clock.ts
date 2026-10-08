/** One seed clock per page load; saved records retain their original dates. */
export const seedTime = Date.now();
export function seedDate(offsetDays: number): string {
  return new Date(seedTime + offsetDays * 86400000).toISOString();
}
