export function cssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

export function chartColors() {
  return {
    chart1: cssVar("--color-chart-1", "hsl(168 82% 33%)"),
    chart2: cssVar("--color-chart-2", "hsl(168 55% 53%)"),
    chart3: cssVar("--color-chart-3", "hsl(207 88% 67%)"),
    chart4: cssVar("--color-chart-4", "hsl(258 90% 76%)"),
    chart5: cssVar("--color-chart-5", "hsl(40 90% 63%)"),
    chart6: cssVar("--color-chart-6", "hsl(0 84% 72%)"),
    success: cssVar("--color-success", "hsl(160 84% 31%)"),
    warning: cssVar("--color-warning", "hsl(32 95% 44%)"),
    info: cssVar("--color-info", "hsl(207 73% 46%)"),
    destructive: "hsl(var(--destructive))",
    muted: "hsl(var(--muted-foreground))",
    border: "hsl(var(--border))",
    foreground: "hsl(var(--foreground))",
    card: "hsl(var(--card))",
  };
}

export const statusChartColor: Record<string, string> = {
  processing: "var(--color-warning)",
  shipping: "var(--color-info)",
  delivered: "var(--color-success)",
  canceled: "hsl(var(--destructive))",
};

export const chartAxisStyle = {
  fontSize: 12,
  fill: "hsl(var(--muted-foreground))",
};

export const chartGridStyle = {
  stroke: "hsl(var(--border))",
  strokeDasharray: "3 3",
};
