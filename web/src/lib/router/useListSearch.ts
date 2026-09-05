import { useNavigate } from '@tanstack/react-router'
import { toggleSort } from '@/lib/list/sort'

export interface BaseListSearch {
  page: number
  pageSize: number
  search?: string
  status?: string
  sort?: string
  type?: string
}

export function useListSearch<T extends BaseListSearch>(to: string, search: T) {
  const navigate = useNavigate()

  const patch = (updates: Partial<BaseListSearch>, resetPage = false) => {
    const next = { ...search, ...updates } as T
    if (resetPage) next.page = 1
    if (next.search === '') next.search = undefined
    void navigate({ to, search: next })
  }

  const onSortChange = (field: string) => {
    patch({ sort: toggleSort(search.sort, field) }, true)
  }

  return { patch, onSortChange }
}
