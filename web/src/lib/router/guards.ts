import { redirect } from '@tanstack/react-router'
import { can } from '@/lib/permissions'
import type { PermissionArea, PermissionAction } from '@/types'
import type { RouterContext } from './context'
import { getSessionUser } from './session'

export function requireStaffSession({ context }: { context: RouterContext }) {
  const me = getSessionUser(context)
  if (!me || me.actorType !== 'admin') {
    throw redirect({ to: '/auth/login' })
  }
}

export function requireSellerSession({ context }: { context: RouterContext }) {
  const me = getSessionUser(context)
  if (!me || me.actorType !== 'seller') {
    throw redirect({ to: '/auth/login' })
  }
}

export function requireBuyerSession({ context }: { context: RouterContext }) {
  const me = getSessionUser(context)
  if (!me || me.actorType !== 'buyer') {
    throw redirect({ to: '/auth/login' })
  }
}

export function requireGrant(
  context: RouterContext,
  area: PermissionArea,
  action: PermissionAction = 'view',
) {
  requireStaffSession({ context })
  const me = getSessionUser(context)!
  if (!can(me.grants, me.isSuperuser ?? false, area, action)) {
    throw redirect({ to: '/403' })
  }
}

export function redirectIfAuthenticated({ context }: { context: RouterContext }) {
  const me = getSessionUser(context)
  if (!me) return
  if (me.actorType === 'admin') throw redirect({ to: '/admin' })
  if (me.actorType === 'seller') throw redirect({ to: '/seller' })
  if (me.actorType === 'buyer') throw redirect({ to: '/account' })
}
