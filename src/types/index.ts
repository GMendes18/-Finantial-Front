// Auth Types
export interface User {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt?: string
  _count?: {
    transactions: number
    categories: number
  }
}

export interface AuthResponse {
  status: 'success' | 'error'
  message: string
  data: {
    user: User
    token: string
  }
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

// Category Types
export type CategoryType = 'INCOME' | 'EXPENSE'

export interface Category {
  id: string
  name: string
  type: CategoryType
  color: string
  icon: string
  createdAt: string
  updatedAt: string
  _count?: {
    transactions: number
  }
}

export interface CategoryFormData {
  name: string
  type: CategoryType
  color?: string
  icon?: string
}

// Transaction Types
export interface Transaction {
  id: string
  type: CategoryType
  amount: string
  description: string | null
  date: string
  categoryId: string
  category: Pick<Category, 'id' | 'name' | 'color' | 'icon'>
  createdAt: string
  updatedAt: string
}

export interface TransactionFormData {
  type: CategoryType
  amount: number
  description?: string
  date: string
  categoryId: string
}

export interface TransactionFilters {
  type?: CategoryType
  categoryId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

// Report Types
export interface ReportSummary {
  period: {
    startDate: string
    endDate: string
  }
  income: {
    total: number
    count: number
  }
  expense: {
    total: number
    count: number
  }
  balance: number
  savingsRate: number
}

export interface CategoryReport {
  category: Category
  type: CategoryType
  total: number
  count: number
  percentage: number
}

export interface ReportByCategory {
  period: {
    startDate: string
    endDate: string
  }
  income: CategoryReport[]
  expense: CategoryReport[]
}

export interface BalanceReport {
  totalIncome: number
  totalExpense: number
  currentBalance: number
}

export interface MonthlyTrend {
  month: string
  income: number
  expense: number
  balance: number
}

// API Response Types
export interface ApiResponse<T> {
  status: 'success' | 'error'
  message?: string
  data: T
}

export interface PaginatedResponse<T> {
  status: 'success' | 'error'
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ApiError {
  status: 'error'
  message: string
  errors?: Record<string, string[]>
}
