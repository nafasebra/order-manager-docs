import { useQuery } from '@tanstack/react-query'
import { PageHeader, DescriptionList, StatusChip } from '@/components/patterns'
import { products } from '@/lib/api'
import { formatMoney, formatDate } from '@/lib/utils'

interface AdminProductDetailPageProps {
  productId: string
}

export function AdminProductDetailPage({ productId }: AdminProductDetailPageProps) {
  const { data: product } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => products.getProduct(productId),
  })
  const { data: images } = useQuery({
    queryKey: ['product-images', productId],
    queryFn: () => products.getProductImages(productId),
  })

  if (!product) return <div className="text-muted-foreground">Loading…</div>

  return (
    <div>
      <PageHeader
        title={product.name}
        description={product.sellerName}
        actions={<StatusChip domain="product" status={product.status} />}
      />
      {images?.[0] && (
        <img
          src={images[0].url}
          alt={product.name}
          className="mb-6 h-48 w-48 rounded-lg border object-cover"
        />
      )}
      <DescriptionList
        items={[
          { label: 'Price', value: formatMoney(product.salePrice ?? product.price) },
          { label: 'Stock', value: String(product.stockQty) },
          { label: 'Updated', value: formatDate(product.updatedAt) },
          { label: 'Description', value: product.technicalDescription },
        ]}
      />
    </div>
  )
}
