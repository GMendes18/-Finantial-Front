import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Category, CategoryFormData, CategoryType, ApiResponse, CategorySuggestion } from '@/types'

export function useCategories(type?: CategoryType) {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: () =>
      api.get<ApiResponse<Category[]>>('/categories', type ? { type } : undefined),
    select: (data) => data.data,
  })
}

export function useSuggestCategory() {
  return useMutation({
    mutationFn: ({ description, type }: { description: string; type: CategoryType }) =>
      api.post<ApiResponse<CategorySuggestion | null>>('/categories/suggest', { description, type }),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CategoryFormData) =>
      api.post<ApiResponse<Category>>('/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CategoryFormData> }) =>
      api.put<ApiResponse<Category>>(`/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
