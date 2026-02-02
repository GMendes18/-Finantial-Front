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
  keywords?: string[]
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
  keywords?: string[]
}

// Category Suggestion Types
export interface CategorySuggestion {
  categoryId: string
  categoryName: string
  confidence: number
  matchedKeyword: string | null
}

// Frequency Type for Recurring Transactions
export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

// Transaction Types
export interface Transaction {
  id: string
  type: CategoryType
  amount: string
  description: string | null
  date: string
  categoryId: string
  category: Pick<Category, 'id' | 'name' | 'color' | 'icon'>
  isRecurring?: boolean
  frequency?: Frequency
  recurringEndDate?: string
  createdAt: string
  updatedAt: string
}

export interface TransactionFormData {
  type: CategoryType
  amount: number
  description?: string
  date: string
  categoryId: string
  isRecurring?: boolean
  frequency?: Frequency
  recurringEndDate?: string
}

export interface TransactionFilters {
  type?: CategoryType
  categoryId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  isRecurring?: boolean
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

// Investment Types
export interface Investment {
  id: string
  symbol: string
  name: string
  shares: number
  purchasePrice: number
  purchaseDate: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface InvestmentFormData {
  symbol: string
  name: string
  shares: number
  purchasePrice: number
  purchaseDate: string
  notes?: string
}

export interface InvestmentPosition {
  id: string
  symbol: string
  name: string
  shares: number
  purchasePrice: number
  purchaseDate: string
  notes?: string
  invested: number
  currentPrice: number
  currentValue: number
  gain: number
  gainPercent: number
  dayChange: number
  dayChangePercent: number
}

export interface PortfolioSummary {
  totalInvested: number
  currentValue: number
  totalGain: number
  totalGainPercent: number
  positions: InvestmentPosition[]
}

// Insights Types
export interface Insight {
  id: string
  type: 'alert' | 'tip' | 'achievement' | 'trend'
  title: string
  description: string
  icon: string
}

export interface InsightsSummary {
  totalIncome: number
  totalExpense: number
  balance: number
  topCategory: string
  topCategoryAmount: number
  savingsRate: number
}

export interface InsightsData {
  generatedAt: string
  insights: Insight[]
  summary: InsightsSummary
}

// Exchange Types
export interface CurrencyData {
  symbol: string
  rate: number
  inverseRate: number
  variation: number
  trend: 'up' | 'down'
  sparkline: number[]
  lastUpdate: string
}

export interface ExchangeWidgetData {
  base: string
  date: string
  currencies: CurrencyData[]
}
