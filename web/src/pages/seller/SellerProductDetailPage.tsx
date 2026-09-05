import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { PageHeader, DescriptionList, StatusChip } from '@/components/patterns'
import { Button } from '@/components/ui/button'
import { products } from '@/lib/api'
import { formatMoney, formatDate } from '@/lib/utils'

interface SellerProductDetailPageProps {
  productId: string
}

export function SellerProductDetailPage({ productId }: SellerProductDetailPageProps) {
  const { data: product } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => products.getProduct(productId),
  })

  if (!product) return <div className="text-muted-foreground">Loading…</div>

  return (
    <div>
      <PageHeader
        title={product.name}
        description={`Updated ${formatDate(product.updatedAt)}`}
        actions={
          <div className="flex gap-2">
            <StatusChip domain="product" status={product.status} />
            <Button asChild variant="outline">
              <Link to="/seller/products/$productId/edit" params={{ productId }}>
                Edit
              </Link>
            </Button>
          </div>
        }
      />
      <DescriptionList
        items={[
          { label: 'Price', value: formatMoney(product.salePrice ?? product.price) },
          { label: 'Stock', value: String(product.stockQty) },
          { label: 'Description', value: product.technicalDescription },
        ]}
      />
    </div>
  )
}
