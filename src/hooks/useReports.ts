import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ReportSummary, ReportByCategory, BalanceReport, MonthlyTrend, ApiResponse } from '@/types'

interface ReportFilters {
  month?: number
  year?: number
  startDate?: string
  endDate?: string
  [key: string]: string | number | undefined
}

export function useReportSummary(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: ['reports', 'summary', filters],
    queryFn: () => api.get<ApiResponse<ReportSummary>>('/reports/summary', filters),
    select: (data) => data.data,
  })
}

export function useReportByCategory(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: ['reports', 'by-category', filters],
    queryFn: () => api.get<ApiResponse<ReportByCategory>>('/reports/by-category', filters),
    select: (data) => data.data,
  })
}

export function useBalance() {
  return useQuery({
    queryKey: ['reports', 'balance'],
    queryFn: () => api.get<ApiResponse<BalanceReport>>('/reports/balance'),
    select: (data) => data.data,
  })
}

export function useMonthlyTrend(months: number = 6) {
  return useQuery({
    queryKey: ['reports', 'monthly-trend', months],
    queryFn: () => api.get<ApiResponse<MonthlyTrend[]>>('/reports/monthly-trend', { months }),
    select: (data) => data.data,
  })
}
