import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Palette,
  Tags,
  ExternalLink,
} from 'lucide-react'
import { Card, Button, Input, Modal, PageLoader, EmptyState, KeywordsInput } from '@/components/ui'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories'
import type { Category, CategoryType } from '@/types'

const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome muito longo'),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
  icon: z.string().optional(),
  keywords: z.array(z.string()).optional(),
})

type CategoryForm = z.infer<typeof categorySchema>

const colorPalette = [
  '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b',
  '#f97316', '#ef4444', '#f43f5e', '#ec4899', '#d946ef',
  '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9',
  '#06b6d4', '#14b8a6', '#64748b', '#78716c', '#71717a',
]

export function Categories() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<CategoryType>('EXPENSE')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

  const { data: categories, isLoading } = useCategories()

  const navigateToTransactions = (categoryId: string) => {
    navigate(`/transactions?categoryId=${categoryId}`)
  }
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      type: 'EXPENSE',
      color: '#10b981',
    },
  })

  const watchColor = watch('color')
  const watchKeywords = watch('keywords') || []

  const filteredCategories = categories?.filter((c) => c.type === activeTab) || []

  const openCreateModal = (type: CategoryType) => {
    setEditingCategory(null)
    reset({
      type,
      name: '',
      color: type === 'INCOME' ? '#10b981' : '#f43f5e',
      icon: '',
      keywords: [],
    })
    setIsModalOpen(true)
  }

  const openEditModal = (category: Category) => {
    setEditingCategory(category)
    reset({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon || '',
      keywords: category.keywords || [],
    })
    setIsModalOpen(true)
  }

  const openDeleteModal = (category: Category) => {
    setDeletingCategory(category)
    setIsDeleteModalOpen(true)
  }

  const onSubmit = async (data: CategoryForm) => {
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({ id: editingCategory.id, data })
      } else {
        await createMutation.mutateAsync(data)
      }
      setIsModalOpen(false)
      reset()
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  const handleDelete = async () => {
    if (!deletingCategory) return

    try {
      await deleteMutation.mutateAsync(deletingCategory.id)
      setIsDeleteModalOpen(false)
      setDeletingCategory(null)
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

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
            Categorias
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Organize suas transações em categorias
          </p>
        </div>
        <Button onClick={() => openCreateModal(activeTab)}>
          <Plus className="w-4 h-4" />
          Nova Categoria
        </Button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('EXPENSE')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === 'EXPENSE'
              ? 'bg-[var(--color-expense)]/10 text-[var(--color-expense)] border border-[var(--color-expense)]/30'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)]'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          Despesas
          <span className="px-2 py-0.5 rounded-full bg-[var(--color-bg-tertiary)] text-xs">
            {categories?.filter((c) => c.type === 'EXPENSE').length || 0}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('INCOME')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === 'INCOME'
              ? 'bg-[var(--color-income)]/10 text-[var(--color-income)] border border-[var(--color-income)]/30'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Receitas
          <span className="px-2 py-0.5 rounded-full bg-[var(--color-bg-tertiary)] text-xs">
            {categories?.filter((c) => c.type === 'INCOME').length || 0}
          </span>
        </button>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title={`Nenhuma categoria de ${activeTab === 'INCOME' ? 'receita' : 'despesa'}`}
          description="Crie categorias para organizar suas transações de forma eficiente."
          action={{ label: 'Criar Categoria', onClick: () => openCreateModal(activeTab) }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  hover
                  className="group relative overflow-hidden cursor-pointer"
                  onClick={() => navigateToTransactions(category.id)}
                >
                  {/* Color Bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: category.color }}
                  />

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <Tags className="w-6 h-6" style={{ color: category.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--color-text-primary)]">
                          {category.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-[var(--color-text-muted)]">
                            {category._count?.transactions || 0} transações
                          </p>
                          <ExternalLink className="w-3 h-3 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditModal(category)
                        }}
                        className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openDeleteModal(category)
                        }}
                        className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-expense)] hover:bg-[var(--color-expense)]/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Nome"
            type="text"
            placeholder="Ex: Alimentação"
            error={errors.name?.message}
            {...register('name')}
          />

          {/* Color Picker */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
              Cor
            </label>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl border-2 border-[var(--color-surface-border-hover)]"
                style={{ backgroundColor: watchColor }}
              />
              <div className="flex-1 grid grid-cols-10 gap-2">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setValue('color', color)}
                    className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                      watchColor === color ? 'ring-2 ring-offset-2 ring-offset-[var(--color-bg-secondary)] ring-[var(--color-accent)]' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            {errors.color && (
              <p className="text-sm text-[var(--color-expense)]">{errors.color.message}</p>
            )}
          </div>

          {/* Custom Color Input */}
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-[var(--color-text-muted)]" />
            <Input
              type="text"
              placeholder="#000000"
              {...register('color')}
              className="flex-1"
            />
          </div>

          {/* Keywords for auto-categorization */}
          <KeywordsInput
            label="Palavras-chave para categorização automática"
            value={watchKeywords}
            onChange={(keywords) => setValue('keywords', keywords)}
            placeholder="Ex: ifood, restaurante, mercado..."
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
              isLoading={createMutation.isPending || updateMutation.isPending}
              className="flex-1"
            >
              {editingCategory ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Excluir Categoria"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-[var(--color-text-secondary)]">
            Tem certeza que deseja excluir esta categoria?
          </p>
          {deletingCategory && (
            <div className="p-4 rounded-lg bg-[var(--color-bg-tertiary)]">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${deletingCategory.color}20` }}
                >
                  <Tags className="w-5 h-5" style={{ color: deletingCategory.color }} />
                </div>
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {deletingCategory.name}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {deletingCategory._count?.transactions || 0} transações vinculadas
                  </p>
                </div>
              </div>
            </div>
          )}
          {deletingCategory?._count?.transactions && deletingCategory._count.transactions > 0 ? (
            <p className="text-sm text-[var(--color-expense)]">
              Esta categoria possui transações vinculadas e não pode ser excluída.
            </p>
          ) : null}
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
              disabled={Boolean(deletingCategory?._count?.transactions && deletingCategory._count.transactions > 0)}
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
