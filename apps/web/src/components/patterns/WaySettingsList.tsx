import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VirtualList } from "@/components/patterns/VirtualList";
import { cn } from "@/lib/utils";

export type WaySetting = {
  id: string;
  name: string;
  enabled: boolean;
  label: string;
  instructions: string;
  sortOrder: number;
};

type WaySettingsListProps = {
  title: string;
  items: WaySetting[];
  onChange: (items: WaySetting[]) => void;
  paymentHint?: boolean;
  className?: string;
};

export function WaySettingsList({
  title,
  items,
  onChange,
  paymentHint,
  className,
}: WaySettingsListProps) {
  const enabledCount = items.filter((i) => i.enabled).length;

  function update(id: string, patch: Partial<WaySetting>) {
    onChange(
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  return (
    <div className={cn("space-y-3 rounded-md border border-border bg-card p-4", className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
      {paymentHint ? (
        <Alert>
          <AlertDescription>
            No card numbers or CVV — payment ways are labels and instructions only.
          </AlertDescription>
        </Alert>
      ) : null}
      {enabledCount === 0 ? (
        <Alert variant="destructive">
          <AlertDescription>
            At least one method must be enabled.
          </AlertDescription>
        </Alert>
      ) : null}
      <VirtualList
        items={items}
        estimateSize={96}
        height={Math.min(480, Math.max(160, items.length * 96))}
        getKey={(item) => item.id}
        renderItem={(item) => (
          <div className="flex flex-col gap-2 border-b border-border py-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex min-w-40 items-center gap-2">
              <Switch
                checked={item.enabled}
                onCheckedChange={(enabled) => update(item.id, { enabled })}
                aria-label={`Enable ${item.name}`}
              />
              <span className="text-sm font-medium">{item.name}</span>
            </div>
            <div className="flex flex-1 flex-col gap-2 sm:flex-row">
              <div className="flex-1 space-y-1">
                <Label htmlFor={`label-${item.id}`} className="sr-only">
                  Label for {item.name}
                </Label>
                <Input
                  id={`label-${item.id}`}
                  value={item.label}
                  onChange={(e) => update(item.id, { label: e.target.value })}
                  placeholder="Label"
                  disabled={!item.enabled}
                />
              </div>
              <div className="flex-[2] space-y-1">
                <Label htmlFor={`instructions-${item.id}`} className="sr-only">
                  Instructions for {item.name}
                </Label>
                <Input
                  id={`instructions-${item.id}`}
                  value={item.instructions}
                  onChange={(e) =>
                    update(item.id, { instructions: e.target.value })
                  }
                  placeholder="Instructions"
                  disabled={!item.enabled}
                />
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
}
