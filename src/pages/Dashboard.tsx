import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Link } from 'react-router-dom'
import { Card, PageLoader, Badge } from '@/components/ui'
import { ExchangeWidget } from '@/components/ExchangeWidget'
import { InsightsWidget } from '@/components/InsightsWidget'
import { useReportSummary, useReportByCategory, useBalance, useMonthlyTrend } from '@/hooks/useReports'
import { useTransactions } from '@/hooks/useTransactions'
import { formatCurrency, formatMonth, formatDate, formatPercentage, getCurrentMonthYear } from '@/lib/utils'

export function Dashboard() {
  const { month, year } = getCurrentMonthYear()
  const { data: summary, isLoading: loadingSummary } = useReportSummary({ month, year })
  const { data: byCategory, isLoading: loadingCategory } = useReportByCategory({ month, year })
  const { data: balance, isLoading: loadingBalance } = useBalance()
  const { data: trend, isLoading: loadingTrend } = useMonthlyTrend(6)
  const { data: recentTransactions, isLoading: loadingTransactions } = useTransactions({ limit: 5 })

  const isLoading = loadingSummary || loadingCategory || loadingBalance || loadingTrend

  if (isLoading) {
    return <PageLoader />
  }

  const trendData = trend?.map((item) => ({
    name: formatMonth(item.month),
    receitas: item.income,
    despesas: item.expense,
    saldo: item.balance,
  })) || []

  const expenseData = byCategory?.expense.map((item) => ({
    name: item.category.name,
    value: item.total,
    color: item.category.color,
  })) || []

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
          Dashboard
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Visão geral das suas finanças em {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Saldo Atual"
          value={formatCurrency(balance?.currentBalance || 0)}
          icon={Wallet}
          variant="accent"
          delay={0}
        />
        <StatsCard
          title="Receitas do Mês"
          value={formatCurrency(summary?.income.total || 0)}
          subtitle={`${summary?.income.count || 0} transações`}
          icon={TrendingUp}
          variant="income"
          delay={0.1}
        />
        <StatsCard
          title="Despesas do Mês"
          value={formatCurrency(summary?.expense.total || 0)}
          subtitle={`${summary?.expense.count || 0} transações`}
          icon={TrendingDown}
          variant="expense"
          delay={0.2}
        />
        <StatsCard
          title="Taxa de Economia"
          value={formatPercentage(summary?.savingsRate || 0)}
          subtitle={`Saldo: ${formatCurrency(summary?.balance || 0)}`}
          icon={PiggyBank}
          variant="default"
          delay={0.3}
        />
      </div>

      {/* Exchange Widget + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="h-full"
        >
          <ExchangeWidget />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="h-full"
        >
          <InsightsWidget />
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="xl:col-span-2"
        >
          <Card className="h-full">
            <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--color-text-primary)] mb-6">
              Evolução Financeira
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0} />
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
                  <Area
                    type="monotone"
                    dataKey="receitas"
                    stroke="var(--color-income)"
                    strokeWidth={2}
                    fill="url(#incomeGradient)"
                    name="Receitas"
                  />
                  <Area
                    type="monotone"
                    dataKey="despesas"
                    stroke="var(--color-expense)"
                    strokeWidth={2}
                    fill="url(#expenseGradient)"
                    name="Despesas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Expense by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full">
            <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--color-text-primary)] mb-6">
              Despesas por Categoria
            </h3>
            {expenseData.length > 0 ? (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
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
                <div className="mt-4 space-y-2">
                  {expenseData.slice(0, 4).map((item) => (
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
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48 text-[var(--color-text-muted)]">
                Nenhuma despesa registrada
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
              Transações Recentes
            </h3>
            <Link
              to="/transactions"
              className="text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-light)] transition-colors"
            >
              Ver todas
            </Link>
          </div>

          {loadingTransactions ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-[var(--color-bg-tertiary)] rounded-lg" />
              ))}
            </div>
          ) : recentTransactions?.data.length ? (
            <div className="space-y-3">
              {recentTransactions.data.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-bg-tertiary)]/50 hover:bg-[var(--color-bg-tertiary)] transition-colors"
                >
                  <div className="flex items-center gap-4">
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
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {formatDate(transaction.date)} • {transaction.category.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
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
                    <Badge type={transaction.type}>
                      {transaction.type === 'INCOME' ? 'Receita' : 'Despesa'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[var(--color-text-muted)]">
              Nenhuma transação encontrada
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ElementType
  variant: 'default' | 'income' | 'expense' | 'accent'
  delay?: number
}

function StatsCard({ title, value, subtitle, icon: Icon, variant, delay = 0 }: StatsCardProps) {
  const iconColors = {
    default: 'text-[var(--color-text-secondary)] bg-[var(--color-bg-tertiary)]',
    income: 'text-[var(--color-income)] bg-[var(--color-income)]/10',
    expense: 'text-[var(--color-expense)] bg-[var(--color-expense)]/10',
    accent: 'text-[var(--color-accent)] bg-[var(--color-accent)]/10',
  }

  const valueColors = {
    default: 'text-[var(--color-text-primary)]',
    income: 'text-gradient-income',
    expense: 'text-gradient-expense',
    accent: 'text-gradient-accent',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="h-full"
    >
      <Card variant={variant} hover className="h-full">
        <div className="flex items-start justify-between h-full">
          <div className="flex flex-col min-h-[72px]">
            <p className="text-sm font-medium text-[var(--color-text-muted)] mb-1">
              {title}
            </p>
            <p className={`text-2xl font-bold font-[family-name:var(--font-display)] tabular-nums ${valueColors[variant]}`}>
              {value}
            </p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1 min-h-[20px]">
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
