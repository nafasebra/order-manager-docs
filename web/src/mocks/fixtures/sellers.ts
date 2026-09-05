import type { Seller, SellerWay } from '@/types'

export const sellers: Seller[] = [
  {
    id: 'seller-1',
    displayName: 'GreenLeaf Shop',
    contactName: 'Alice Green',
    contactEmail: 'alice@greenleaf.test',
    contactPhone: '+44 7700 900001',
    loginEmail: 'alice@greenleaf.test',
    workplaceAddressText: '12 Garden Lane, London, SW1A 1AA',
    status: 'enabled',
    lastLoginAt: '2026-09-04T07:00:00Z',
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2026-09-04T07:00:00Z',
  },
  {
    id: 'seller-2',
    displayName: 'TechHub Store',
    contactName: 'Bob Tech',
    contactEmail: 'bob@techhub.test',
    contactPhone: '+44 7700 900002',
    loginEmail: 'bob@techhub.test',
    workplaceAddressText: '45 Innovation Park, Manchester, M1 2AB',
    status: 'enabled',
    lastLoginAt: '2026-09-03T16:00:00Z',
    createdAt: '2025-02-20T00:00:00Z',
    updatedAt: '2026-09-03T16:00:00Z',
  },
  {
    id: 'seller-3',
    displayName: 'Artisan Crafts',
    contactName: 'Carol Craft',
    contactEmail: 'carol@artisan.test',
    contactPhone: '+44 7700 900003',
    loginEmail: 'carol@artisan.test',
    workplaceAddressText: '8 Workshop Row, Bristol, BS1 3CD',
    status: 'enabled',
    lastLoginAt: '2026-09-02T11:00:00Z',
    createdAt: '2025-03-10T00:00:00Z',
    updatedAt: '2026-09-02T11:00:00Z',
  },
  {
    id: 'seller-4',
    displayName: 'HomeStyle Living',
    contactName: 'David Home',
    contactEmail: 'david@homestyle.test',
    contactPhone: '+44 7700 900004',
    loginEmail: 'david@homestyle.test',
    workplaceAddressText: '22 Decor Avenue, Leeds, LS1 4EF',
    status: 'enabled',
    lastLoginAt: '2026-09-01T08:00:00Z',
    createdAt: '2025-04-05T00:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'seller-5',
    displayName: 'FitGear Pro',
    contactName: 'Eve Fitness',
    contactEmail: 'eve@fitgear.test',
    contactPhone: '+44 7700 900005',
    loginEmail: 'eve@fitgear.test',
    workplaceAddressText: '99 Gym Street, Birmingham, B1 5GH',
    status: 'disabled',
    lastLoginAt: '2026-07-10T10:00:00Z',
    createdAt: '2025-05-12T00:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
  },
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `seller-${i + 6}`,
    displayName: `Vendor ${i + 6}`,
    contactName: `Contact ${i + 6}`,
    contactEmail: `vendor${i + 6}@test.com`,
    contactPhone: `+44 7700 90000${i + 6}`,
    loginEmail: `vendor${i + 6}@test.com`,
    workplaceAddressText: `${i + 6} Trade Street, London`,
    status: 'enabled' as const,
    lastLoginAt: '2026-08-20T00:00:00Z',
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z',
  })),
]

const deliveryTemplates = [
  { code: 'standard', label: 'Standard Shipping', instructions: 'Delivered in 3-5 business days.' },
  { code: 'express', label: 'Express Delivery', instructions: 'Next-day delivery available.' },
  { code: 'pickup', label: 'Store Pickup', instructions: 'Collect from our location during business hours.' },
]

const paymentTemplates = [
  { code: 'cod', label: 'Cash on Delivery', instructions: 'Pay when your order arrives.' },
  { code: 'bank_transfer', label: 'Bank Transfer', instructions: 'Transfer to account ending 4521. Reference your order number.' },
  { code: 'card', label: 'Card Payment', instructions: 'Pay securely at checkout.' },
]

export const sellerDeliveryMethods: SellerWay[] = sellers.flatMap((seller) =>
  deliveryTemplates.map((t, i) => ({
    id: `dm-${seller.id}-${t.code}`,
    sellerId: seller.id,
    code: t.code,
    label: t.label,
    enabled: i < 2 || seller.status === 'enabled',
    instructions: t.instructions,
    sortOrder: i,
  })),
)

export const sellerPaymentWays: SellerWay[] = sellers.flatMap((seller) =>
  paymentTemplates.map((t, i) => ({
    id: `pw-${seller.id}-${t.code}`,
    sellerId: seller.id,
    code: t.code,
    label: t.label,
    enabled: i < 2,
    instructions: t.instructions,
    sortOrder: i,
  })),
)
