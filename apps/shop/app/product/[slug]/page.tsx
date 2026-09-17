import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/catalog";
import { getRelatedProducts } from "@/lib/recommend";
import { formatMoney } from "@/lib/utils";
import { AddToCartButton } from "@/components/AddToCartButton";
import { RecommendRow } from "@/components/RecommendRow";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  return {
    title: product?.name ?? "Product",
    description: product?.description,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product, 4);

  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <nav className="text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <Link
            href={`/category/${product.categorySlug}`}
            className="hover:text-primary"
          >
            {product.category}
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div
          className="aspect-square rounded-lg border border-border"
          style={{
            background: `linear-gradient(145deg, hsl(${product.imageHue} 45% 88%), hsl(${product.imageHue} 55% 68%))`,
          }}
          role="img"
          aria-label={product.name}
        />

        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{product.category}</p>
            <h1 className="text-3xl font-semibold tracking-tight">
              {product.name}
            </h1>
            <p className="text-2xl font-semibold text-foreground">
              {formatMoney(product.price, product.currency)}
            </p>
            <p className="text-sm text-muted-foreground">
              Sold by{" "}
              <span className="font-medium text-foreground">
                {product.sellerName}
              </span>
            </p>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <dl className="grid grid-cols-2 gap-3 rounded-md border border-border bg-card p-4 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">SKU</dt>
              <dd className="font-medium">{product.id.toUpperCase()}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Availability</dt>
              <dd className="font-medium">
                {product.stock > 0 ? "In stock" : "Out of stock"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Popularity</dt>
              <dd className="font-medium">{product.popularity}/100</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Category</dt>
              <dd className="font-medium">
                <Link
                  href={`/category/${product.categorySlug}`}
                  className="text-primary hover:underline"
                >
                  {product.category}
                </Link>
              </dd>
            </div>
          </dl>

          <AddToCartButton product={product} />

          <div className="flex gap-3 pt-2">
            <Link
              href="/checkout"
              className="text-sm font-medium text-primary hover:underline"
            >
              Go to checkout
            </Link>
            <Link
              href="/products"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>

      <RecommendRow
        title="You may also like"
        subtitle={`More from ${product.category}`}
        products={related}
        viewAllHref={`/category/${product.categorySlug}`}
      />
    </div>
  );
}
