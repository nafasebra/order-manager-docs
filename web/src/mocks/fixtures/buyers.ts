import type { Buyer, Address } from '@/types'

const firstNames = ['Sarah', 'John', 'Emma', 'Michael', 'Olivia', 'James', 'Sophia', 'William', 'Ava', 'Daniel']
const lastNames = ['Miller', 'Smith', 'Brown', 'Wilson', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris']

export const buyers: Buyer[] = Array.from({ length: 30 }, (_, i) => {
  const first = firstNames[i % firstNames.length]
  const last = lastNames[i % lastNames.length]
  const id = `buyer-${i + 1}`
  return {
    id,
    name: `${first} ${last}`,
    username: `${first.toLowerCase()}.${last.toLowerCase()}${i > 9 ? i : ''}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${i > 9 ? i : ''}@example.com`,
    status: i === 28 ? 'suspended' : 'active',
    registeredAt: new Date(2025, i % 12, (i % 28) + 1).toISOString(),
    lastActivityAt: new Date(2026, 8, (i % 28) + 1).toISOString(),
    lastLoginAt: new Date(2026, 8, (i % 28) + 1).toISOString(),
    createdAt: new Date(2025, i % 12, (i % 28) + 1).toISOString(),
    updatedAt: new Date(2026, 8, (i % 28) + 1).toISOString(),
  }
})

export const addresses: Address[] = buyers.flatMap((buyer, i) => [
  {
    id: `addr-${buyer.id}-1`,
    buyerId: buyer.id,
    type: 'shipping' as const,
    line: `${100 + i} High Street`,
    city: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Bristol'][i % 5],
    region: 'England',
    postalCode: `SW${(i % 9) + 1}A ${100 + i}AA`,
    country: 'GB',
    isDefaultShipping: true,
    isDefaultBilling: i % 3 === 0,
  },
  ...(i % 4 === 0
    ? [
        {
          id: `addr-${buyer.id}-2`,
          buyerId: buyer.id,
          type: 'billing' as const,
          line: `${200 + i} Park Lane`,
          city: 'London',
          region: 'England',
          postalCode: `W1A ${i}AA`,
          country: 'GB',
          isDefaultShipping: false,
          isDefaultBilling: true,
        },
      ]
    : []),
])
