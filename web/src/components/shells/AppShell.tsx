import { useState } from 'react'
import {
  Bell,
  HelpCircle,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sun,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { getTheme, setTheme, getSidebarCollapsed, setSidebarCollapsed } from '@/lib/auth/session'
import { cn } from '@/lib/utils'
import type { SessionUser } from '@/types'
import type { NavSection } from './SidebarNav'
import { SidebarNav } from './SidebarNav'

interface AppShellProps {
  panel: 'admin' | 'seller' | 'buyer'
  panelLabel: string
  sections: NavSection[]
  user: SessionUser
  onLogout: () => void
  children: React.ReactNode
}

export function AppShell({
  panel,
  panelLabel,
  sections,
  user,
  onLogout,
  children,
}: AppShellProps) {
  const [dark, setDark] = useState(() => getTheme() === 'dark')
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(() => getSidebarCollapsed())

  const toggleTheme = () => {
    const next = dark ? 'light' : 'dark'
    setTheme(next)
    setDark(!dark)
  }

  const toggleSidebar = () => {
    setSidebarCollapsedState((prev) => {
      const next = !prev
      setSidebarCollapsed(next)
      return next
    })
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const sidebar = (
    <SidebarNav sections={sections} panelLabel={panelLabel} collapsed={sidebarCollapsed} />
  )

  return (
    <div data-panel={panel} className="flex min-h-screen flex-col lg:flex-row">
      <aside
        className={cn(
          'hidden shrink-0 border-r bg-card transition-[width] duration-200 ease-in-out dark:bg-[hsl(213_33%_19%)] lg:block',
          sidebarCollapsed ? 'w-[var(--sidebar-width-collapsed)]' : 'w-[var(--sidebar-width)]',
        )}
      >
        {sidebar}
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-[var(--header-height)] items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[var(--sidebar-width)] bg-card p-0 dark:bg-[hsl(213_33%_19%)]"
            >
              <SidebarNav sections={sections} panelLabel={panelLabel} />
            </SheetContent>
          </Sheet>

          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:inline-flex"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!sidebarCollapsed}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>

          <div className="relative hidden max-w-sm flex-1 md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search…" className="pl-9" />
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Help">
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm sm:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>
                  <User className="mr-2 h-4 w-4" />
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
