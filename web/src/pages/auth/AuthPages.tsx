import { useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { auth } from '@/lib/api'
import { getLoginOptions } from '@/lib/api/auth'
import { syncRouterSession } from '@/lib/router/session'
import { initTheme } from '@/lib/auth/session'

const loginOptions = getLoginOptions()

export function LoginPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [panel, setPanel] = useState<'staff' | 'seller' | 'buyer'>('staff')
  const [userId, setUserId] = useState(loginOptions.staff[0].userId)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const options = loginOptions[panel]

  const handlePanelChange = (p: 'staff' | 'seller' | 'buyer') => {
    setPanel(p)
    setUserId(loginOptions[p][0].userId)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      initTheme()
      const me = await auth.login(panel, userId)
      const nextContext = syncRouterSession(
        { queryClient, me: router.options.context.me },
        me,
      )
      router.update({ context: nextContext })
      if (me.actorType === 'admin') void navigate({ to: '/admin' })
      else if (me.actorType === 'seller') void navigate({ to: '/seller' })
      else void navigate({ to: '/account' })
    } catch {
      setError('Invalid credentials for this panel.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Clean Commerce</CardTitle>
          <CardDescription>Sign in to your panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="space-y-2">
              <Label>Panel</Label>
              <Select value={panel} onValueChange={(v) => handlePanelChange(v as typeof panel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff (Admin)</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="buyer">Buyer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Account</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.map((opt) => (
                    <SelectItem key={opt.userId} value={opt.userId}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export function SessionExpiredPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-semibold">Session expired</h1>
      <p className="text-muted-foreground">Please sign in again to continue.</p>
      <Button asChild>
        <a href="/auth/login">Sign in</a>
      </Button>
    </div>
  )
}

export function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-semibold">403 — Forbidden</h1>
      <p className="text-muted-foreground">You do not have permission to view this page.</p>
      <Button variant="outline" asChild>
        <a href="/auth/login">Back to login</a>
      </Button>
    </div>
  )
}

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-semibold">404 — Not found</h1>
      <Button variant="outline" asChild>
        <a href="/">Go home</a>
      </Button>
    </div>
  )
}

export function IndexRedirect() {
  return null
}
