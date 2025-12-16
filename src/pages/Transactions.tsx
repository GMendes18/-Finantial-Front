import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
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
} from 'lucide-react'
import { Card, Button, Input, Select, Modal, Badge, PageLoader, EmptyState } from '@/components/ui'
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction, TransactionFilters } from '@/types'

const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().positive('Valor deve ser positivo'),
  description: z.string().optional(),
  date: z.string().min(1, 'Data é obrigatória'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
})

type TransactionForm = z.infer<typeof transactionSchema>

export function Transactions() {
  const [filters, setFilters] = useState<TransactionFilters>({ page: 1, limit: 10 })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const { data: transactionsData, isLoading } = useTransactions(filters)
  const { data: categories } = useCategories()
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const deleteMutation = useDeleteTransaction()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'EXPENSE',
      date: new Date().toISOString().split('T')[0],
    },
  })

  const watchType = watch('type')

  const filteredCategories = categories?.filter((c) => c.type === watchType) || []

  const openCreateModal = () => {
    setEditingTransaction(null)
    reset({
      type: 'EXPENSE',
      date: new Date().toISOString().split('T')[0],
      amount: undefined,
      description: '',
      categoryId: '',
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

  if (isLoading) {
    return <PageLoader />
  }

  const transactions = transactionsData?.data || []
  const meta = transactionsData?.meta

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
            Transações
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Gerencie suas receitas e despesas
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          Nova Transação
        </Button>
      </motion.div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Buscar transações..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-surface-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--color-surface-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors lg:hidden"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>

          <div className={`flex flex-col lg:flex-row gap-4 ${showFilters ? 'block' : 'hidden lg:flex'}`}>
            <Select
              options={[
                { value: '', label: 'Todos os tipos' },
                { value: 'INCOME', label: 'Receitas' },
                { value: 'EXPENSE', label: 'Despesas' },
              ]}
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full lg:w-40"
            />

            <Select
              options={[
                { value: '', label: 'Todas as categorias' },
                ...(categories?.map((c) => ({ value: c.id, label: c.name })) || []),
              ]}
              value={filters.categoryId || ''}
              onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              className="w-full lg:w-48"
            />

            <Input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full lg:w-40"
            />

            <Input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full lg:w-40"
            />
          </div>
        </div>
      </Card>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Nenhuma transação encontrada"
          description="Comece adicionando sua primeira transação para acompanhar suas finanças."
          action={{ label: 'Adicionar Transação', onClick: openCreateModal }}
        />
      ) : (
        <Card className="overflow-hidden !p-0">
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
                  {transactions.map((transaction) => (
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
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${transaction.category.color}20` }}
                          >
                            {transaction.type === 'INCOME' ? (
                              <ArrowUpRight className="w-5 h-5" style={{ color: transaction.category.color }} />
                            ) : (
                              <ArrowDownRight className="w-5 h-5" style={{ color: transaction.category.color }} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-[var(--color-text-primary)]">
                              {transaction.description || transaction.category.name}
                            </p>
                            <Badge type={transaction.type}>
                              {transaction.type === 'INCOME' ? 'Receita' : 'Despesa'}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: transaction.category.color }}
                          />
                          <span className="text-[var(--color-text-secondary)]">
                            {transaction.category.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-[var(--color-text-secondary)]">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="p-4 text-right">
                        <span
                          className={`font-semibold tabular-nums ${
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
                        <div className="flex items-center justify-end gap-2">
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
                Mostrando {((meta.page - 1) * meta.limit) + 1} a {Math.min(meta.page * meta.limit, meta.total)} de {meta.total} transações
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
                  Página {meta.page} de {meta.totalPages}
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

          <Input
            label="Valor"
            type="number"
            step="0.01"
            placeholder="0,00"
            error={errors.amount?.message}
            {...register('amount', { valueAsNumber: true })}
          />

          <Input
            label="Descrição"
            type="text"
            placeholder="Ex: Compras do mês"
            error={errors.description?.message}
            {...register('description')}
          />

          <Input
            label="Data"
            type="date"
            error={errors.date?.message}
            {...register('date')}
          />

          <Select
            label="Categoria"
            options={filteredCategories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Selecione uma categoria"
            error={errors.categoryId?.message}
            {...register('categoryId')}
          />

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
