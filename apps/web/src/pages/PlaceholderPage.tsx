import { PageHeader } from "@/components/patterns/PageHeader";
import { EmptyState } from "@/components/patterns/EmptyState";
import { Button } from "@/components/ui/button";

type PlaceholderPageProps = {
  title: string;
  description?: string;
  actionLabel?: string;
};

export function PlaceholderPage({
  title,
  description,
  actionLabel,
}: PlaceholderPageProps) {
  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          actionLabel ? <Button type="button">{actionLabel}</Button> : null
        }
      />
      <EmptyState
        title={`${title} coming online`}
        description="This MVP placeholder uses the Clean Commerce page recipe. Wire TanStack Query when the API is ready."
      />
    </div>
  );
}
