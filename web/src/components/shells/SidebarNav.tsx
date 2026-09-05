import { Link, useRouterState } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  exact?: boolean
}

export interface NavSection {
  label?: string
  items: NavItem[]
}

interface SidebarNavProps {
  sections: NavSection[]
  panelLabel?: string
  collapsed?: boolean
}

export function SidebarNav({ sections, panelLabel, collapsed = false }: SidebarNavProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return pathname === to
    return pathname === to || pathname.startsWith(`${to}/`)
  }

  return (
    <nav className={cn('flex flex-col gap-6', collapsed ? 'p-2' : 'p-4')}>
      {panelLabel && !collapsed && (
        <div className="px-2 text-sm font-semibold text-foreground">{panelLabel}</div>
      )}
      {sections.map((section, i) => (
        <div key={i}>
          {section.label && !collapsed && (
            <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {section.label}
            </p>
          )}
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = isActive(item.to, item.exact)
              const Icon = item.icon
              const link = (
                <Link
                  to={item.to}
                  className={cn(
                    'flex items-center rounded-md text-sm transition-colors',
                    collapsed ? 'justify-center p-2' : 'gap-2 px-2 py-2',
                    active
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                  aria-label={collapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )

              return (
                <li key={item.to}>
                  {collapsed ? (
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right" className="font-normal">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    link
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
