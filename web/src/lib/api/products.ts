import { delay, paginate } from '@/lib/utils'
import { applySort } from '@/lib/list/sort'
import { db, createProduct, updateProduct } from '@/mocks/db'
import { sellers } from '@/mocks/fixtures/sellers'
import type { ListParams, Paginated, Product, ProductStatus } from '@/types'

export interface ProductListItem extends Product {
  sellerName: string
}

function enrich(p: Product): ProductListItem {
  return {
    ...p,
    sellerName: sellers.find((s) => s.id === p.sellerId)?.displayName ?? 'Unknown',
  }
}

export async function listProducts(
  params: ListParams & { sellerId?: string } = {},
): Promise<Paginated<ProductListItem>> {
  await delay()
  const { page = 1, pageSize = 25, search = '', status, sellerId, sort } = params
  let items = db.products.map(enrich)
  if (sellerId) items = items.filter((p) => p.sellerId === sellerId)
  if (status) items = items.filter((p) => p.status === status)
  if (search) {
    const q = search.toLowerCase()
    items = items.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sellerName.toLowerCase().includes(q),
    )
  }
  items = applySort(
    items,
    sort,
    {
      name: (a, b) => a.name.localeCompare(b.name),
      sellerName: (a, b) => a.sellerName.localeCompare(b.sellerName),
      price: (a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price),
      status: (a, b) => a.status.localeCompare(b.status),
      stockQty: (a, b) => a.stockQty - b.stockQty,
      updatedAt: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    },
    'updatedAt:desc',
  )
  return paginate(items, page, pageSize)
}

export async function getProduct(id: string): Promise<ProductListItem | null> {
  await delay()
  const p = db.products.find((x) => x.id === id)
  return p ? enrich(p) : null
}

export async function getProductImages(productId: string) {
  await delay(100)
  return db.productImages.filter((i) => i.productId === productId)
}

export async function createProductApi(data: {
  sellerId: string
  name: string
  technicalDescription: string
  price: number
  salePrice?: number | null
  status: ProductStatus
  stockQty: number
}) {
  await delay()
  return enrich(createProduct(data))
}

export async function updateProductApi(id: string, data: Partial<Product>) {
  await delay()
  const updated = updateProduct(id, data)
  return updated ? enrich(updated) : null
}
