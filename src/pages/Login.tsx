import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Wallet } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input } from '@/components/ui'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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

          {/* Stats Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 flex gap-8"
          >
            <div>
              <p className="text-3xl font-bold font-[family-name:var(--font-display)] text-gradient-income">
                +62%
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">Taxa de economia</p>
            </div>
            <div>
              <p className="text-3xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
                R$ 17k
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">Saldo médio</p>
            </div>
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
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-[var(--color-expense)]/10 border border-[var(--color-expense)]/20"
              >
                <p className="text-sm text-[var(--color-expense)]">{error}</p>
              </motion.div>
            )}

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
