import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, ArrowRight, Wallet, AlertCircle, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input } from '@/components/ui'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

// Rotating stats for the login page
const marketingStats = [
  { value: '+62%', label: 'Taxa de economia', color: 'income' },
  { value: 'R$ 17k', label: 'Saldo médio', color: 'default' },
  { value: '3.2k', label: 'Usuários ativos', color: 'accent' },
  { value: '98%', label: 'Satisfação', color: 'income' },
  { value: '-23%', label: 'Redução de gastos', color: 'income' },
  { value: 'R$ 2.5M', label: 'Economizados', color: 'accent' },
]

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentStats, setCurrentStats] = useState([marketingStats[0], marketingStats[1]])

  // Rotate stats every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStats(prev => {
        const availableStats = marketingStats.filter(s => !prev.includes(s))
        const randomIndex = Math.floor(Math.random() * availableStats.length)
        const newStat = availableStats[randomIndex]
        return [prev[1], newStat]
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setError('')
    setIsLoading(true)

    try {
      await login(data)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[var(--color-bg-primary)]">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/5 via-transparent to-[var(--color-income)]/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-accent)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-income)]/10 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)]">
                <Wallet className="w-8 h-8 text-[var(--color-text-inverse)]" />
              </div>
              <span className="text-2xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
                Financy
              </span>
            </div>

            <h1 className="text-5xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)] leading-tight mb-6">
              Controle suas
              <br />
              <span className="text-gradient-accent">finanças</span> com
              <br />
              inteligência
            </h1>

            <p className="text-lg text-[var(--color-text-secondary)] max-w-md">
              Acompanhe receitas, despesas e alcance seus objetivos financeiros
              com uma interface moderna e intuitiva.
            </p>
          </motion.div>

          {/* Stats Preview - Dynamic */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 flex gap-8"
          >
            {currentStats.map((stat, index) => (
              <AnimatePresence mode="wait" key={index}>
                <motion.div
                  key={stat.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className={`text-3xl font-bold font-[family-name:var(--font-display)] ${
                    stat.color === 'income'
                      ? 'text-gradient-income'
                      : stat.color === 'accent'
                      ? 'text-gradient-accent'
                      : 'text-[var(--color-text-primary)]'
                  }`}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">{stat.label}</p>
                </motion.div>
              </AnimatePresence>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-16">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)]">
              <Wallet className="w-6 h-6 text-[var(--color-text-inverse)]" />
            </div>
            <span className="text-xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
              Financy
            </span>
          </div>

          <h2 className="text-3xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)] mb-2">
            Bem-vindo de volta
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-8">
            Entre com suas credenciais para acessar sua conta
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="p-4 rounded-lg bg-[var(--color-expense)]/10 border border-[var(--color-expense)]/20"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-[var(--color-expense)] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--color-expense)]">
                        Erro ao fazer login
                      </p>
                      <p className="text-sm text-[var(--color-expense)]/80 mt-1">
                        {error}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setError('')}
                      className="p-1 rounded hover:bg-[var(--color-expense)]/20 transition-colors"
                    >
                      <X className="w-4 h-4 text-[var(--color-expense)]" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              icon={<Mail className="w-5 h-5" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Entrar
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="mt-8 text-center text-[var(--color-text-secondary)]">
            Não tem uma conta?{' '}
            <Link
              to="/register"
              className="font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-light)] transition-colors"
            >
              Criar conta
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
