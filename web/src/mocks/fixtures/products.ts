import type { Product, ProductImage } from '@/types'
import { sellers } from './sellers'

const productNames = [
  'Organic Cotton T-Shirt',
  'Wireless Bluetooth Headphones',
  'Handmade Ceramic Mug',
  'Smart Watch Pro',
  'Linen Throw Pillow',
  'USB-C Charging Hub',
  'Scented Soy Candle',
  'Ergonomic Office Chair',
  'Stainless Steel Water Bottle',
  'Leather Wallet',
  'Yoga Mat Premium',
  'Desk Lamp LED',
  'Running Shoes Elite',
  'Coffee Grinder Manual',
  'Bamboo Cutting Board',
]

const statuses: Product['status'][] = ['published', 'published', 'published', 'draft', 'out_of_stock', 'archived']

export const products: Product[] = Array.from({ length: 60 }, (_, i) => {
  const seller = sellers[i % sellers.length]
  const basePrice = 1500 + (i % 20) * 500
  return {
    id: `product-${i + 1}`,
    sellerId: seller.id,
    name: `${productNames[i % productNames.length]} ${Math.floor(i / productNames.length) > 0 ? `v${Math.floor(i / productNames.length) + 1}` : ''}`.trim(),
    technicalDescription: `High-quality ${productNames[i % productNames.length].toLowerCase()} from ${seller.displayName}. Built for everyday use with premium materials.`,
    price: basePrice,
    salePrice: i % 5 === 0 ? Math.round(basePrice * 0.85) : null,
    status: statuses[i % statuses.length],
    stockQty: 10 + (i % 50),
    createdAt: new Date(2025, i % 12, (i % 28) + 1).toISOString(),
    updatedAt: new Date(2026, 8, (i % 28) + 1).toISOString(),
  }
})

export const productImages: ProductImage[] = products.map((p) => ({
  id: `img-${p.id}`,
  productId: p.id,
  url: `https://picsum.photos/seed/${p.id}/400/400`,
  isPrimary: true,
  sortOrder: 0,
}))
