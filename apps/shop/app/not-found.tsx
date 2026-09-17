import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md space-y-4 py-16 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        That product, category, or page does not exist in this storefront shell.
      </p>
      <div className="flex justify-center gap-3 pt-2">
        <Link
          href="/"
          className="inline-flex h-9 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Home
        </Link>
        <Link
          href="/products"
          className="inline-flex h-9 items-center rounded-sm border border-input px-4 text-sm hover:bg-accent"
        >
          Browse products
        </Link>
      </div>
    </div>
  );
}
