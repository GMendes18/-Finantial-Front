import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, Wallet, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input } from '@/components/ui'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export function Register() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setError('')
    setIsLoading(true)

    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    'Dashboard com visão geral das finanças',
    'Categorização automática de despesas',
    'Relatórios detalhados e gráficos',
    'Metas financeiras personalizadas',
  ]

  return (
    <div className="min-h-screen flex bg-[var(--color-bg-primary)]">
      {/* Left Side - Register Form */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
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
            Criar conta
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-8">
            Comece a controlar suas finanças hoje mesmo
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
              label="Nome"
              type="text"
              placeholder="Seu nome"
              icon={<User className="w-5 h-5" />}
              error={errors.name?.message}
              {...register('name')}
            />

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

            <Input
              label="Confirmar senha"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Criar conta
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="mt-8 text-center text-[var(--color-text-secondary)]">
            Já tem uma conta?{' '}
            <Link
              to="/login"
              className="font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-light)] transition-colors"
            >
              Fazer login
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="absolute inset-0 bg-gradient-to-bl from-[var(--color-income)]/5 via-transparent to-[var(--color-accent)]/5" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[var(--color-income)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-[var(--color-accent)]/10 rounded-full blur-3xl" />

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

            <h1 className="text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)] leading-tight mb-6">
              Tudo que você precisa
              <br />
              para suas <span className="text-gradient-income">finanças</span>
            </h1>

            <ul className="space-y-4">
              {features.map((feature, index) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="p-1 rounded-full bg-[var(--color-income)]/10">
                    <Check className="w-4 h-4 text-[var(--color-income)]" />
                  </div>
                  <span className="text-[var(--color-text-secondary)]">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
