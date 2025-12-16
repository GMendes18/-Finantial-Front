import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
} from 'lucide-react'
import { Card, Select, PageLoader } from '@/components/ui'
import { useReportSummary, useReportByCategory, useMonthlyTrend } from '@/hooks/useReports'
import { formatCurrency, formatMonth, formatPercentage, getCurrentMonthYear } from '@/lib/utils'

export function Reports() {
  const currentDate = getCurrentMonthYear()
  const [month, setMonth] = useState(currentDate.month)
  const [year, setYear] = useState(currentDate.year)

  const { data: summary, isLoading: loadingSummary } = useReportSummary({ month, year })
  const { data: byCategory, isLoading: loadingCategory } = useReportByCategory({ month, year })
  const { data: trend, isLoading: loadingTrend } = useMonthlyTrend(12)

  const isLoading = loadingSummary || loadingCategory || loadingTrend

  if (isLoading) {
    return <PageLoader />
  }

  const monthOptions = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ]

  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: String(currentDate.year - i),
    label: String(currentDate.year - i),
  }))

  const comparisonData = trend?.map((item) => ({
    name: formatMonth(item.month),
    receitas: item.income,
    despesas: item.expense,
    saldo: item.balance,
  })) || []

  const incomeData = byCategory?.income.map((item) => ({
    name: item.category.name,
    value: item.total,
    color: item.category.color,
    percentage: item.percentage,
  })) || []

  const expenseData = byCategory?.expense.map((item) => ({
    name: item.category.name,
    value: item.total,
    color: item.category.color,
    percentage: item.percentage,
  })) || []

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
            Relatórios
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Análise detalhada das suas finanças
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-[var(--color-text-muted)]" />
          <Select
            options={monthOptions}
            value={String(month)}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-36"
          />
          <Select
            options={yearOptions}
            value={String(year)}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-24"
          />
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total de Receitas"
          value={formatCurrency(summary?.income.total || 0)}
          subtitle={`${summary?.income.count || 0} transações`}
          icon={TrendingUp}
          iconColor="var(--color-income)"
          delay={0}
        />
        <SummaryCard
          title="Total de Despesas"
          value={formatCurrency(summary?.expense.total || 0)}
          subtitle={`${summary?.expense.count || 0} transações`}
          icon={TrendingDown}
          iconColor="var(--color-expense)"
          delay={0.1}
        />
        <SummaryCard
          title="Saldo do Período"
          value={formatCurrency(summary?.balance || 0)}
          subtitle={summary?.balance && summary.balance >= 0 ? 'Positivo' : 'Negativo'}
          icon={Target}
          iconColor={summary?.balance && summary.balance >= 0 ? 'var(--color-income)' : 'var(--color-expense)'}
          delay={0.2}
        />
        <SummaryCard
          title="Taxa de Economia"
          value={formatPercentage(summary?.savingsRate || 0)}
          subtitle="Do total de receitas"
          icon={PiggyBank}
          iconColor="var(--color-accent)"
          delay={0.3}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--color-text-primary)] mb-6">
              Receitas por Categoria
            </h3>
            {incomeData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incomeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {incomeData.map((entry, index) => (
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
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {incomeData.map((item) => (
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
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-[var(--color-text-primary)] tabular-nums">
                          {formatCurrency(item.value)}
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)] tabular-nums w-12 text-right">
                          {formatPercentage(item.percentage)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-[var(--color-text-muted)]">
                Nenhuma receita registrada
              </div>
            )}
          </Card>
        </motion.div>

        {/* Expense by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--color-text-primary)] mb-6">
              Despesas por Categoria
            </h3>
            {expenseData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {expenseData.map((entry, index) => (
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
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {expenseData.map((item) => (
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
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-[var(--color-text-primary)] tabular-nums">
                          {formatCurrency(item.value)}
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)] tabular-nums w-12 text-right">
                          {formatPercentage(item.percentage)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-[var(--color-text-muted)]">
                Nenhuma despesa registrada
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Monthly Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--color-text-primary)] mb-6">
            Comparativo Mensal (Últimos 12 meses)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-border)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-surface-border)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'var(--color-text-primary)' }}
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Bar dataKey="receitas" fill="var(--color-income)" radius={[4, 4, 0, 0]} name="Receitas" />
                <Bar dataKey="despesas" fill="var(--color-expense)" radius={[4, 4, 0, 0]} name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Balance Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--color-text-primary)] mb-6">
            Evolução do Saldo
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparisonData}>
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-border)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-surface-border)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'var(--color-text-primary)' }}
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Line
                  type="monotone"
                  dataKey="saldo"
                  stroke="var(--color-accent)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-accent)', strokeWidth: 2 }}
                  name="Saldo"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

interface SummaryCardProps {
  title: string
  value: string
  subtitle: string
  icon: React.ElementType
  iconColor: string
  delay?: number
}

function SummaryCard({ title, value, subtitle, icon: Icon, iconColor, delay = 0 }: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--color-text-muted)] mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)] tabular-nums">
              {value}
            </p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {subtitle}
            </p>
          </div>
          <div
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${iconColor}20` }}
          >
            <Icon className="w-6 h-6" style={{ color: iconColor }} />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
