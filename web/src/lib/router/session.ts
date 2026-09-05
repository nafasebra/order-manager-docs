import type { SessionUser } from '@/types'
import { ME_QUERY_KEY, type RouterContext } from './context'

/** Session for route guards — prefers live Query cache over bootstrap router context. */
export function getSessionUser(context: RouterContext): SessionUser | null {
  const cached = context.queryClient.getQueryData<SessionUser | null>(ME_QUERY_KEY)
  if (cached !== undefined) return cached
  return context.me ?? null
}

export function syncRouterSession(
  context: RouterContext,
  me: SessionUser | null,
): RouterContext {
  context.queryClient.setQueryData(ME_QUERY_KEY, me)
  return { queryClient: context.queryClient, me }
}
