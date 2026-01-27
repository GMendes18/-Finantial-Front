import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  PieChart,
  Wallet,
  RefreshCw,
  X,
} from 'lucide-react'
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { usePortfolio, useCreateInvestment, useDeleteInvestment } from '@/hooks/useInvestments'
import { Card, Button, Input, PageLoader } from '@/components/ui'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import type { InvestmentFormData, InvestmentPosition } from '@/types'

// Portfolio allocation colors
const COLORS = ['#8b5cf6', '#06b6d4', '#22c55e', '#f97316', '#ec4899', '#eab308', '#3b82f6', '#ef4444']

export function Investments() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: portfolio, isLoading, refetch, isFetching } = usePortfolio()
  const createMutation = useCreateInvestment()
  const deleteMutation = useDeleteInvestment()

  if (isLoading) {
    return <PageLoader />
  }

  const allocationData = portfolio?.positions.map((pos, index) => ({
    name: pos.symbol,
    value: pos.currentValue,
    color: COLORS[index % COLORS.length],
  })) || []

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
            Investimentos
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Acompanhe seu portfolio de investimentos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => refetch()}
            className="p-2 rounded-lg bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-surface-border)] transition-colors"
            title="Atualizar cotações"
          >
            <RefreshCw
              className={`w-5 h-5 text-[var(--color-text-muted)] ${isFetching ? 'animate-spin' : ''}`}
            />
          </motion.button>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Investimento
          </Button>
        </div>
      </motion.div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Investido"
          value={formatCurrency(portfolio?.totalInvested || 0)}
          icon={Wallet}
          variant="default"
          delay={0}
        />
        <SummaryCard
          title="Valor Atual"
          value={formatCurrency(portfolio?.currentValue || 0)}
          icon={PieChart}
          variant="accent"
          delay={0.1}
        />
        <SummaryCard
          title="Ganho/Perda"
          value={formatCurrency(portfolio?.totalGain || 0)}
          subtitle={`${(portfolio?.totalGainPercent || 0) >= 0 ? '+' : ''}${formatPercentage(portfolio?.totalGainPercent || 0)}`}
          icon={(portfolio?.totalGain || 0) >= 0 ? TrendingUp : TrendingDown}
          variant={(portfolio?.totalGain || 0) >= 0 ? 'income' : 'expense'}
          delay={0.2}
        />
        <SummaryCard
          title="Posições"
          value={String(portfolio?.positions.length || 0)}
          subtitle="ativos diferentes"
          icon={PieChart}
          variant="default"
          delay={0.3}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Positions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="xl:col-span-2"
        >
          <Card>
            <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--color-text-primary)] mb-6">
              Posições
            </h3>

            {portfolio?.positions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-[var(--color-text-muted)]">
                <PieChart className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Nenhum investimento</p>
                <p className="text-sm">Adicione seu primeiro investimento para começar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {portfolio?.positions.map((position, index) => (
                  <PositionCard
                    key={position.id}
                    position={position}
                    color={COLORS[index % COLORS.length]}
                    onDelete={() => deleteMutation.mutate(position.id)}
                    isDeleting={deleteMutation.isPending}
                  />
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Allocation Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full">
            <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--color-text-primary)] mb-6">
              Alocação
            </h3>

            {allocationData.length > 0 ? (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--color-bg-secondary)',
                          border: '1px solid var(--color-surface-border)',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => formatCurrency(value as number)}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="mt-4 space-y-2">
                  {allocationData.map((item) => {
                    const total = allocationData.reduce((sum, i) => sum + i.value, 0)
                    const percentage = total > 0 ? (item.value / total) * 100 : 0

                    return (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-[var(--color-text-secondary)]">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-[var(--color-text-primary)] tabular-nums">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48 text-[var(--color-text-muted)]">
                Sem dados para exibir
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Add Investment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <AddInvestmentModal
            onClose={() => setIsModalOpen(false)}
            onSubmit={(data) => {
              createMutation.mutate(data, {
                onSuccess: () => setIsModalOpen(false),
              })
            }}
            isSubmitting={createMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

interface SummaryCardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ElementType
  variant: 'default' | 'income' | 'expense' | 'accent'
  delay?: number
}

function SummaryCard({ title, value, subtitle, icon: Icon, variant, delay = 0 }: SummaryCardProps) {
  const iconColors = {
    default: 'text-[var(--color-text-secondary)] bg-[var(--color-bg-tertiary)]',
    income: 'text-[var(--color-income)] bg-[var(--color-income)]/10',
    expense: 'text-[var(--color-expense)] bg-[var(--color-expense)]/10',
    accent: 'text-[var(--color-accent)] bg-[var(--color-accent)]/10',
  }

  const valueColors = {
    default: 'text-[var(--color-text-primary)]',
    income: 'text-[var(--color-income)]',
    expense: 'text-[var(--color-expense)]',
    accent: 'text-gradient-accent',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="h-full"
    >
      <Card hover className="h-full">
        <div className="flex items-start justify-between h-full">
          <div className="flex flex-col min-h-[72px]">
            <p className="text-sm font-medium text-[var(--color-text-muted)] mb-1">
              {title}
            </p>
            <p className={`text-2xl font-bold font-[family-name:var(--font-display)] tabular-nums ${valueColors[variant]}`}>
              {value}
            </p>
            <p className={`text-sm mt-1 min-h-[20px] ${variant === 'income' ? 'text-[var(--color-income)]' : variant === 'expense' ? 'text-[var(--color-expense)]' : 'text-[var(--color-text-muted)]'}`}>
              {subtitle || '\u00A0'}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${iconColors[variant]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

interface PositionCardProps {
  position: InvestmentPosition
  color: string
  onDelete: () => void
  isDeleting: boolean
}

function PositionCard({ position, color, onDelete, isDeleting }: PositionCardProps) {
  const isProfit = position.gain >= 0
  const isDayProfit = position.dayChange >= 0

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="group flex items-center justify-between p-4 rounded-xl bg-[var(--color-bg-tertiary)]/50 hover:bg-[var(--color-bg-tertiary)] transition-all"
    >
      <div className="flex items-center gap-4">
        {/* Color indicator */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: color }}
        >
          {position.symbol.substring(0, 2)}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--color-text-primary)]">
              {position.symbol}
            </span>
            <span className="text-sm text-[var(--color-text-muted)]">
              {position.name}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
            <span>{position.shares} cotas</span>
            <span>•</span>
            <span>Preço médio: {formatCurrency(position.purchasePrice)}</span>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="flex items-center gap-6">
        {/* Day change */}
        <div className="hidden md:block text-right">
          <div className={`text-sm font-medium ${isDayProfit ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]'}`}>
            {isDayProfit ? '+' : ''}{position.dayChangePercent.toFixed(2)}%
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">
            Hoje
          </div>
        </div>

        {/* Total gain */}
        <div className="text-right">
          <div className={`font-semibold ${isProfit ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]'}`}>
            {isProfit ? '+' : ''}{formatCurrency(position.gain)}
          </div>
          <div className={`text-sm ${isProfit ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]'}`}>
            {isProfit ? '+' : ''}{position.gainPercent.toFixed(2)}%
          </div>
        </div>

        {/* Current value */}
        <div className="text-right min-w-[100px]">
          <div className="font-bold text-lg tabular-nums text-[var(--color-text-primary)]">
            {formatCurrency(position.currentValue)}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">
            @ {formatCurrency(position.currentPrice)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-2 rounded-lg text-[var(--color-expense)] hover:bg-[var(--color-expense)]/10 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

interface AddInvestmentModalProps {
  onClose: () => void
  onSubmit: (data: InvestmentFormData) => void
  isSubmitting: boolean
}

function AddInvestmentModal({ onClose, onSubmit, isSubmitting }: AddInvestmentModalProps) {
  const [formData, setFormData] = useState<InvestmentFormData>({
    symbol: '',
    name: '',
    shares: 0,
    purchasePrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[var(--color-bg-secondary)] rounded-2xl shadow-xl border border-[var(--color-surface-border)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-surface-border)]">
          <h2 className="text-xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
            Novo Investimento
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--color-text-muted)]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Símbolo"
              placeholder="AAPL"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
              required
            />
            <Input
              label="Nome"
              placeholder="Apple Inc."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantidade"
              type="number"
              step="0.000001"
              min="0"
              placeholder="10"
              value={formData.shares || ''}
              onChange={(e) => setFormData({ ...formData, shares: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="Preço de Compra"
              type="number"
              step="0.01"
              min="0"
              placeholder="150.00"
              value={formData.purchasePrice || ''}
              onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <Input
            label="Data de Compra"
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
            required
          />

          <Input
            label="Notas (opcional)"
            placeholder="Anotações sobre o investimento..."
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
