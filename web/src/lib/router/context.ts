import type { QueryClient } from '@tanstack/react-query'
import type { SessionUser } from '@/types'

export interface RouterContext {
  queryClient: QueryClient
  me: SessionUser | null
}

export const ME_QUERY_KEY = ['me'] as const
