import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SellerWay } from '@/types'

interface WaySettingsListProps {
  title: string
  ways: SellerWay[]
  onChange: (ways: SellerWay[]) => void
  onSave: (ways: SellerWay[]) => Promise<{ ok: boolean; error?: string }>
  showPaymentHint?: boolean
}

export function WaySettingsList({
  title,
  ways,
  onChange,
  onSave,
  showPaymentHint,
}: WaySettingsListProps) {
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const updateWay = (id: string, patch: Partial<SellerWay>) => {
    onChange(ways.map((w) => (w.id === id ? { ...w, ...patch } : w)))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const result = await onSave(ways)
    if (!result.ok) setError(result.error ?? 'Save failed')
    setSaving(false)
  }

  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showPaymentHint && (
          <p className="text-xs text-muted-foreground">
            No card numbers or CVV — instructions only.
          </p>
        )}
        {ways.map((way) => (
          <div key={way.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start">
            <div className="flex items-center gap-2 sm:w-32">
              <Switch
                checked={way.enabled}
                onCheckedChange={(enabled) => updateWay(way.id, { enabled })}
                aria-label={`Enable ${way.label}`}
              />
              <span className="text-sm font-medium">{way.label}</span>
            </div>
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Display label</Label>
                <Input
                  value={way.label}
                  onChange={(e) => updateWay(way.id, { label: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Instructions</Label>
                <Input
                  value={way.instructions}
                  onChange={(e) => updateWay(way.id, { instructions: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {ways.filter((w) => w.enabled).length === 0 && (
          <Alert>
            <AlertDescription>At least one method must be enabled.</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
