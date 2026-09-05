import { delay } from '@/lib/utils'
import { getStoredSession, setStoredSession, clearStoredSession } from '@/lib/auth/session'
import { adminGrants, adminUsers, loginAccounts } from '@/mocks/fixtures/admins'
import { buyers } from '@/mocks/fixtures/buyers'
import { sellers } from '@/mocks/fixtures/sellers'
import type { SessionUser } from '@/types'

export async function login(
  panel: 'staff' | 'seller' | 'buyer',
  userId: string,
): Promise<SessionUser> {
  await delay()
  if (panel === 'staff') {
    const admin = adminUsers.find((a) => a.id === userId)
    if (!admin || admin.status !== 'active') throw new Error('Invalid credentials')
    setStoredSession({ actorType: 'admin', userId: admin.id })
    return {
      actorType: 'admin',
      id: admin.id,
      name: admin.name,
      email: admin.email,
      isSuperuser: admin.isSuperuser,
      grants: adminGrants[admin.id],
    }
  }
  if (panel === 'seller') {
    const seller = sellers.find((s) => s.id === userId)
    if (!seller || seller.status !== 'enabled') throw new Error('Invalid credentials')
    setStoredSession({ actorType: 'seller', userId: seller.id })
    return {
      actorType: 'seller',
      id: seller.id,
      name: seller.displayName,
      email: seller.loginEmail,
      sellerId: seller.id,
    }
  }
  const buyer = buyers.find((b) => b.id === userId)
  if (!buyer || buyer.status !== 'active') throw new Error('Invalid credentials')
  setStoredSession({ actorType: 'buyer', userId: buyer.id })
  return {
    actorType: 'buyer',
    id: buyer.id,
    name: buyer.name,
    email: buyer.email,
    buyerId: buyer.id,
  }
}

export async function logout(): Promise<void> {
  await delay(100)
  clearStoredSession()
}

export async function getMe(): Promise<SessionUser | null> {
  await delay(150)
  const session = getStoredSession()
  if (!session) return null
  if (session.actorType === 'admin') {
    const admin = adminUsers.find((a) => a.id === session.userId)
    if (!admin || admin.status !== 'active') return null
    return {
      actorType: 'admin',
      id: admin.id,
      name: admin.name,
      email: admin.email,
      isSuperuser: admin.isSuperuser,
      grants: adminGrants[admin.id],
    }
  }
  if (session.actorType === 'seller') {
    const seller = sellers.find((s) => s.id === session.userId)
    if (!seller || seller.status !== 'enabled') return null
    return {
      actorType: 'seller',
      id: seller.id,
      name: seller.displayName,
      email: seller.loginEmail,
      sellerId: seller.id,
    }
  }
  const buyer = buyers.find((b) => b.id === session.userId)
  if (!buyer || buyer.status !== 'active') return null
  return {
    actorType: 'buyer',
    id: buyer.id,
    name: buyer.name,
    email: buyer.email,
    buyerId: buyer.id,
  }
}

export function getLoginOptions() {
  return loginAccounts
}
