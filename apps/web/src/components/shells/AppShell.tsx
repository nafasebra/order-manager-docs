import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { template } from "@/config/template";
import { setSession } from "@/lib/auth/store";
import { resetDemoData } from "@/mocks/store";
import { ConfirmDialog } from "@/components/patterns/ConfirmDialog";
import { Menu, Moon, Sun, LogOut, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types";

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  comingSoon?: boolean;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

type AppShellProps = {
  panel: "admin" | "seller" | "buyer";
  brand: string;
  subtitle?: string;
  sections: NavSection[];
  user: SessionUser | null;
  badge?: ReactNode;
  headerExtra?: ReactNode;
  onLogout?: () => void;
  children: ReactNode;
};

function useThemeToggle() {
  const [dark, setDark] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false,
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("clean-commerce:theme", dark ? "dark" : "light");
    } catch {
      /* Optional preference. */
    }
  }, [dark]);

  return { dark, toggle: () => setDark((v) => !v) };
}

function NavLinks({
  sections,
  onNavigate,
  collapsed,
}: {
  sections: NavSection[];
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  return (
    <nav className="flex flex-col gap-4 px-2 py-2">
      {sections.map((section, i) => (
        <div key={section.title ?? `section-${i}`} className="space-y-1">
          {section.title && !collapsed ? (
            <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {section.title}
            </p>
          ) : null}
          {section.items.map((item) => {
            const Icon = item.icon;
            if (item.comingSoon) {
              return (
                <span
                  key={item.to}
                  className={cn(
                    "flex items-center gap-2 rounded-sm px-2 py-2 text-sm text-sidebar-foreground opacity-50",
                    collapsed && "justify-center px-0",
                  )}
                  title={collapsed ? `${item.label} (soon)` : undefined}
                  aria-disabled
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {!collapsed ? (
                    <span className="truncate">{item.label} (soon)</span>
                  ) : null}
                </span>
              );
            }
            return (
              <Link
                key={item.to}
                // Nav paths are registered in router.tsx; cast keeps NavItem flexible.
                to={item.to as "/"}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2 rounded-sm px-2 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-primary/10 hover:text-primary",
                  "[&.active]:bg-primary/10 [&.active]:text-primary",
                  collapsed && "justify-center px-0",
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {!collapsed ? (
                  <span className="truncate">{item.label}</span>
                ) : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function AppShell({
  panel,
  brand,
  subtitle,
  sections,
  user,
  badge,
  headerExtra,
  onLogout,
  children,
}: AppShellProps) {
  const queryClient = useQueryClient();
  const [resetOpen, setResetOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dark, toggle } = useThemeToggle();
  const initials =
    user?.displayName
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-[var(--header-height)] items-center gap-2 border-b border-sidebar-border px-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{brand}</p>
          {subtitle ? (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {badge}
      </div>
      <ScrollArea className="flex-1">
        <NavLinks sections={sections} onNavigate={() => setMobileOpen(false)} />
      </ScrollArea>
      <Separator />
      <div className="p-3 text-xs text-muted-foreground">{template.brand}</div>
    </div>
  );

  return (
    <div
      data-panel={panel}
      className="flex min-h-screen bg-background text-foreground"
    >
      <aside className="hidden w-[var(--sidebar-width)] shrink-0 border-r border-sidebar-border lg:block">
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-[var(--header-height)] items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[var(--sidebar-width)] p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              {sidebar}
            </SheetContent>
          </Sheet>

          <div className="flex-1">{headerExtra}</div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm sm:inline">
                  {user?.displayName ?? "Account"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-0.5">
                  <span>{user?.displayName}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {template.demo && (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/">Switch demo account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setResetOpen(true)}>
                    Reset demo data
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem
                onClick={onLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset demo data?"
        description="Restore all seeded records and alert settings in this browser. Your demo changes will be removed."
        destructive
        onConfirm={() => {
          resetDemoData();
          setSession(null);
          queryClient.clear();
          window.location.assign("/");
        }}
      />
    </div>
  );
}
