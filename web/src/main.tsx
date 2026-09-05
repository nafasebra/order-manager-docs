import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from '@/router/routeTree'
import { auth } from '@/lib/api'
import { initTheme } from '@/lib/auth/session'
import { ME_QUERY_KEY } from '@/lib/router/context'
import type { RouterContext } from '@/lib/router/context'
import './index.css'

initTheme()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

const router = createRouter({
  routeTree,
  context: {
    queryClient,
    me: null,
  } satisfies RouterContext,
  defaultPreload: 'intent',
})

async function bootstrap() {
  let me = null
  try {
    me = await queryClient.fetchQuery({
      queryKey: ME_QUERY_KEY,
      queryFn: () => auth.getMe(),
    })
  } catch {
    me = null
  }

  router.update({
    context: {
      queryClient,
      me,
    },
  })

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} context={{ queryClient, me }} />
      </QueryClientProvider>
    </StrictMode>,
  )
}

void bootstrap()

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
