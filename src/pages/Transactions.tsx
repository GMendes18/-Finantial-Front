import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Receipt,
  X,
  Repeat,
} from 'lucide-react'
import { Card, Button, Input, Select, Modal, Badge, PageLoader, EmptyState, CurrencyInput, DatePickerInput, CategorySuggestion } from '@/components/ui'
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '@/hooks/useTransactions'
import { useCategories, useSuggestCategory } from '@/hooks/useCategories'
import type { CategorySuggestion as CategorySuggestionType } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction, TransactionFilters } from '@/types'

const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().positive('Valor deve ser positivo'),
  description: z.string().optional(),
  date: z.string().min(1, 'Data é obrigatória'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  isRecurring: z.boolean(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
}).refine(
  (data) => !data.isRecurring || data.frequency,
  { message: 'Selecione a frequência', path: ['frequency'] }
)

type TransactionForm = z.infer<typeof transactionSchema>

const frequencyOptions = [
  { value: 'DAILY', label: 'Diária' },
  { value: 'WEEKLY', label: 'Semanal' },
  { value: 'MONTHLY', label: 'Mensal' },
  { value: 'YEARLY', label: 'Anual' },
]

const frequencyLabels: Record<string, string> = {
  DAILY: 'Diária',
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensal',
  YEARLY: 'Anual',
}

export function Transactions() {
  const [searchParams] = useSearchParams()
  const categoryIdFromUrl = searchParams.get('categoryId')

  const [filters, setFilters] = useState<TransactionFilters>(() => ({
    page: 1,
    limit: 10,
    categoryId: categoryIdFromUrl || undefined,
  }))
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)
  const [showFilters, setShowFilters] = useState(!!categoryIdFromUrl)

  const { data: transactionsData, isLoading, refetch } = useTransactions(filters)

  // Sync URL params with filters
  useEffect(() => {
    if (categoryIdFromUrl) {
      setFilters(prev => {
        if (prev.categoryId !== categoryIdFromUrl) {
          return { ...prev, categoryId: categoryIdFromUrl, page: 1 }
        }
        return prev
      })
      setShowFilters(true)
    }
  }, [categoryIdFromUrl])
  const { data: categories } = useCategories()
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const deleteMutation = useDeleteTransaction()
  const suggestMutation = useSuggestCategory()

  // State for category suggestion
  const [suggestion, setSuggestion] = useState<CategorySuggestionType | null>(null)
  const [suggestionDismissed, setSuggestionDismissed] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'EXPENSE',
      date: new Date().toISOString().split('T')[0],
    },
  })

  const watchType = watch('type')
  const watchDescription = watch('description')
  const watchCategoryId = watch('categoryId')
  const watchIsRecurring = watch('isRecurring')

  const filteredCategories = categories?.filter((c) => c.type === watchType) || []

  // Get color for current suggestion
  const suggestionCategory = suggestion ? categories?.find(c => c.id === suggestion.categoryId) : null

  // Debounced category suggestion
  useEffect(() => {
    // Don't suggest if editing, category already selected, or suggestion dismissed
    if (editingTransaction || watchCategoryId || suggestionDismissed) {
      setSuggestion(null)
      return
    }

    const description = watchDescription?.trim()
    if (!description || description.length < 3) {
      setSuggestion(null)
      return
    }

    const timeoutId = setTimeout(async () => {
      try {
        const result = await suggestMutation.mutateAsync({
          description,
          type: watchType,
        })
        if (result.data) {
          setSuggestion(result.data)
        } else {
          setSuggestion(null)
        }
      } catch {
        setSuggestion(null)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [watchDescription, watchType, editingTransaction, watchCategoryId, suggestionDismissed])

  // Reset suggestion when modal closes or type changes
  useEffect(() => {
    setSuggestion(null)
    setSuggestionDismissed(false)
  }, [isModalOpen, watchType])

  const acceptSuggestion = () => {
    if (suggestion) {
      setValue('categoryId', suggestion.categoryId)
      setSuggestion(null)
    }
  }

  const dismissSuggestion = () => {
    setSuggestion(null)
    setSuggestionDismissed(true)
  }

  // Debounced search - filtra localmente já que a API não tem endpoint de busca
  const debouncedSearch = (term: string) => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(term)
    }, 300)
    return () => clearTimeout(timeoutId)
  }

  // Filtrar transações localmente por termo de busca
  const filteredTransactions = (transactionsData?.data || []).filter((transaction) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      transaction.description?.toLowerCase().includes(term) ||
      transaction.category.name.toLowerCase().includes(term)
    )
  })

  const openCreateModal = () => {
    setEditingTransaction(null)
    setSuggestion(null)
    setSuggestionDismissed(false)
    reset({
      type: 'EXPENSE',
      date: new Date().toISOString().split('T')[0],
      amount: undefined,
      description: '',
      categoryId: '',
      isRecurring: false,
      frequency: undefined,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    reset({
      type: transaction.type,
      amount: parseFloat(transaction.amount),
      description: transaction.description || '',
      date: transaction.date.split('T')[0],
      categoryId: transaction.categoryId,
      isRecurring: transaction.isRecurring || false,
      frequency: transaction.frequency,
    })
    setIsModalOpen(true)
  }

  const openDeleteModal = (transaction: Transaction) => {
    setDeletingTransaction(transaction)
    setIsDeleteModalOpen(true)
  }

  const onSubmit = async (data: TransactionForm) => {
    try {
      if (editingTransaction) {
        await updateMutation.mutateAsync({ id: editingTransaction.id, data })
      } else {
        await createMutation.mutateAsync(data)
      }
      setIsModalOpen(false)
      reset()
      // Força atualização imediata
      refetch()
    } catch (error) {
      console.error('Error saving transaction:', error)
    }
  }

  const handleDelete = async () => {
    if (!deletingTransaction) return

    try {
      await deleteMutation.mutateAsync(deletingTransaction.id)
      setIsDeleteModalOpen(false)
      setDeletingTransaction(null)
      // Força atualização imediata
      refetch()
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  const handleFilterChange = (key: keyof TransactionFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const clearFilters = () => {
    setFilters({ page: 1, limit: 10 })
    setSearchTerm('')
  }

  const hasActiveFilters = filters.type || filters.categoryId || filters.startDate || filters.endDate || searchTerm

  // Refetch quando mutations completam
  useEffect(() => {
    if (createMutation.isSuccess || updateMutation.isSuccess || deleteMutation.isSuccess) {
      refetch()
    }
  }, [createMutation.isSuccess, updateMutation.isSuccess, deleteMutation.isSuccess, refetch])

  if (isLoading) {
    return <PageLoader />
  }

  const meta = transactionsData?.meta

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
            Transações
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)]">
            Gerencie suas receitas e despesas
          </p>
        </div>
        <Button onClick={openCreateModal} className="w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Nova Transação
        </Button>
      </motion.div>

      {/* Filters */}
      <Card className="!p-3 sm:!p-6">
        <div className="space-y-3">
          {/* Search and Filter Toggle */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Buscar por descrição ou categoria..."
                defaultValue={searchTerm}
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-surface-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border transition-colors ${
                showFilters || hasActiveFilters
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                  : 'border-[var(--color-surface-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
              )}
            </button>
          </div>

          {/* Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 border-t border-[var(--color-surface-border)] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Select
                      label="Tipo"
                      options={[
                        { value: '', label: 'Todos os tipos' },
                        { value: 'INCOME', label: 'Receitas' },
                        { value: 'EXPENSE', label: 'Despesas' },
                      ]}
                      value={filters.type || ''}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                    />

                    <Select
                      label="Categoria"
                      options={[
                        { value: '', label: 'Todas as categorias' },
                        ...(categories?.map((c) => ({ value: c.id, label: c.name })) || []),
                      ]}
                      value={filters.categoryId || ''}
                      onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                    />

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                        Data inicial
                      </label>
                      <input
                        type="date"
                        value={filters.startDate || ''}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-surface-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] text-sm [color-scheme:dark]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                        Data final
                      </label>
                      <input
                        type="date"
                        value={filters.endDate || ''}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-surface-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] text-sm [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Limpar filtros
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={searchTerm || hasActiveFilters ? "Nenhuma transação encontrada" : "Nenhuma transação cadastrada"}
          description={searchTerm || hasActiveFilters
            ? "Tente ajustar os filtros ou termo de busca."
            : "Comece adicionando sua primeira transação para acompanhar suas finanças."}
          action={!hasActiveFilters ? { label: 'Adicionar Transação', onClick: openCreateModal } : undefined}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="overflow-hidden !p-0 hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-surface-border)]">
                    <th className="text-left p-4 text-sm font-medium text-[var(--color-text-muted)]">
                      Transação
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--color-text-muted)]">
                      Categoria
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--color-text-muted)]">
                      Data
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-[var(--color-text-muted)]">
                      Valor
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-[var(--color-text-muted)]">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filteredTransactions.map((transaction) => (
                      <motion.tr
                        key={transaction.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-[var(--color-surface-border)] last:border-0 hover:bg-[var(--color-bg-tertiary)]/30 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${transaction.category.color}20` }}
                            >
                              {transaction.type === 'INCOME' ? (
                                <ArrowUpRight className="w-5 h-5" style={{ color: transaction.category.color }} />
                              ) : (
                                <ArrowDownRight className="w-5 h-5" style={{ color: transaction.category.color }} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-[var(--color-text-primary)] truncate">
                                  {transaction.description || transaction.category.name}
                                </p>
                                {transaction.isRecurring && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-[var(--color-accent)]/15 text-[var(--color-accent)]" title={`Recorrente: ${frequencyLabels[transaction.frequency || ''] || ''}`}>
                                    <Repeat className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
                              <Badge type={transaction.type}>
                                {transaction.type === 'INCOME' ? 'Receita' : 'Despesa'}
                              </Badge>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: transaction.category.color }}
                            />
                            <span className="text-[var(--color-text-secondary)] truncate">
                              {transaction.category.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-[var(--color-text-secondary)] whitespace-nowrap">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="p-4 text-right">
                          <span
                            className={`font-semibold tabular-nums whitespace-nowrap ${
                              transaction.type === 'INCOME'
                                ? 'text-[var(--color-income)]'
                                : 'text-[var(--color-expense)]'
                            }`}
                          >
                            {transaction.type === 'INCOME' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(transaction)}
                              className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(transaction)}
                              className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-expense)] hover:bg-[var(--color-expense)]/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-[var(--color-surface-border)]">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Mostrando {((meta.page - 1) * meta.limit) + 1} a {Math.min(meta.page * meta.limit, meta.total)} de {meta.total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(meta.page - 1)}
                    disabled={meta.page === 1}
                    className="p-2 rounded-lg border border-[var(--color-surface-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {meta.page} / {meta.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(meta.page + 1)}
                    disabled={meta.page === meta.totalPages}
                    className="p-2 rounded-lg border border-[var(--color-surface-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </Card>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredTransactions.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="!p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${transaction.category.color}20` }}
                        >
                          {transaction.type === 'INCOME' ? (
                            <ArrowUpRight className="w-5 h-5" style={{ color: transaction.category.color }} />
                          ) : (
                            <ArrowDownRight className="w-5 h-5" style={{ color: transaction.category.color }} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-[var(--color-text-primary)] truncate">
                              {transaction.description || transaction.category.name}
                            </p>
                            {transaction.isRecurring && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-[var(--color-accent)]/15 text-[var(--color-accent)] shrink-0">
                                <Repeat className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: transaction.category.color }}
                            />
                            <span className="text-xs text-[var(--color-text-muted)] truncate">
                              {transaction.category.name}
                            </span>
                            <span className="text-xs text-[var(--color-text-muted)]">•</span>
                            <span className="text-xs text-[var(--color-text-muted)]">
                              {formatDate(transaction.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className={`font-semibold tabular-nums ${
                            transaction.type === 'INCOME'
                              ? 'text-[var(--color-income)]'
                              : 'text-[var(--color-expense)]'
                          }`}
                        >
                          {transaction.type === 'INCOME' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-2">
                          <button
                            onClick={() => openEditModal(transaction)}
                            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(transaction)}
                            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-expense)] hover:bg-[var(--color-expense)]/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Mobile Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => handlePageChange(meta.page - 1)}
                  disabled={meta.page === 1}
                  className="p-2 rounded-lg border border-[var(--color-surface-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Página {meta.page} de {meta.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(meta.page + 1)}
                  disabled={meta.page === meta.totalPages}
                  className="p-2 rounded-lg border border-[var(--color-surface-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTransaction ? 'Editar Transação' : 'Nova Transação'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Type Selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setValue('type', 'INCOME')
                setValue('categoryId', '')
              }}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                watchType === 'INCOME'
                  ? 'border-[var(--color-income)] bg-[var(--color-income)]/10 text-[var(--color-income)]'
                  : 'border-[var(--color-surface-border)] text-[var(--color-text-muted)] hover:border-[var(--color-surface-border-hover)]'
              }`}
            >
              <ArrowUpRight className="w-5 h-5" />
              <span className="font-medium">Receita</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setValue('type', 'EXPENSE')
                setValue('categoryId', '')
              }}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                watchType === 'EXPENSE'
                  ? 'border-[var(--color-expense)] bg-[var(--color-expense)]/10 text-[var(--color-expense)]'
                  : 'border-[var(--color-surface-border)] text-[var(--color-text-muted)] hover:border-[var(--color-surface-border-hover)]'
              }`}
            >
              <ArrowDownRight className="w-5 h-5" />
              <span className="font-medium">Despesa</span>
            </button>
          </div>

          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <CurrencyInput
                label="Valor"
                value={field.value}
                onValueChange={field.onChange}
                error={errors.amount?.message}
              />
            )}
          />

          <Input
            label="Descrição"
            type="text"
            placeholder="Ex: Compras do mês"
            error={errors.description?.message}
            {...register('description')}
          />

          {/* Category Suggestion */}
          {!editingTransaction && (
            <CategorySuggestion
              suggestion={suggestion}
              isLoading={suggestMutation.isPending && !suggestionDismissed}
              onAccept={acceptSuggestion}
              onDismiss={dismissSuggestion}
              categoryColor={suggestionCategory?.color}
            />
          )}

          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <DatePickerInput
                label="Data"
                value={field.value}
                onChange={field.onChange}
                error={errors.date?.message}
              />
            )}
          />

          <Select
            label="Categoria"
            options={filteredCategories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Selecione uma categoria"
            error={errors.categoryId?.message}
            {...register('categoryId')}
          />

          {/* Recurring Transaction Toggle */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  {...register('isRecurring')}
                />
                <div className="w-11 h-6 bg-[var(--color-bg-tertiary)] border border-[var(--color-surface-border)] rounded-full peer-checked:bg-[var(--color-accent)] transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm" />
              </div>
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
                <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Transação recorrente
                </span>
              </div>
            </label>

            {/* Frequency Select - only show when recurring is enabled */}
            <AnimatePresence>
              {watchIsRecurring && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <Select
                    label="Frequência"
                    options={frequencyOptions}
                    placeholder="Selecione a frequência"
                    error={errors.frequency?.message}
                    {...register('frequency')}
                  />
                  <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                    Esta transação será criada automaticamente na frequência selecionada.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={watchType === 'INCOME' ? 'income' : 'expense'}
              isLoading={createMutation.isPending || updateMutation.isPending}
              className="flex-1"
            >
              {editingTransaction ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Excluir Transação"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-[var(--color-text-secondary)]">
            Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
          </p>
          {deletingTransaction && (
            <div className="p-4 rounded-lg bg-[var(--color-bg-tertiary)]">
              <p className="font-medium text-[var(--color-text-primary)]">
                {deletingTransaction.description || deletingTransaction.category.name}
              </p>
              <p className={`text-lg font-semibold ${
                deletingTransaction.type === 'INCOME'
                  ? 'text-[var(--color-income)]'
                  : 'text-[var(--color-expense)]'
              }`}>
                {deletingTransaction.type === 'INCOME' ? '+' : '-'}
                {formatCurrency(deletingTransaction.amount)}
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
              className="flex-1"
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
