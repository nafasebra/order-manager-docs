import "@/mocks/store";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient, router } from "@/router";
import "@/index.css";

try {
  const theme = localStorage.getItem("clean-commerce:theme");
  document.documentElement.classList.toggle(
    "dark",
    theme === "dark" ||
      (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches),
  );
} catch {
  /* Use the default theme when storage is unavailable. */
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>,
);
