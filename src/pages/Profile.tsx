import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User,
  Mail,
  Lock,
  Calendar,
  Save,
  ArrowUpDown,
  Tags,
} from 'lucide-react'
import { Card, Button, Input } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { formatDate, getInitials } from '@/lib/utils'
import type { User as UserType, ApiResponse } from '@/types'

const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export function Profile() {
  const { user, updateUser } = useAuth()
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onProfileSubmit = async (data: ProfileForm) => {
    setProfileError('')
    setProfileSuccess('')
    setIsProfileLoading(true)

    try {
      const response = await api.put<ApiResponse<UserType>>('/users/me', data)
      updateUser(response.data)
      setProfileSuccess('Perfil atualizado com sucesso!')
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Erro ao atualizar perfil')
    } finally {
      setIsProfileLoading(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordForm) => {
    setPasswordError('')
    setPasswordSuccess('')
    setIsPasswordLoading(true)

    try {
      await api.put('/users/me', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      setPasswordSuccess('Senha alterada com sucesso!')
      passwordForm.reset()
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Erro ao alterar senha')
    } finally {
      setIsPasswordLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
          Perfil
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Gerencie suas informações pessoais
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-[var(--color-text-inverse)]">
                {user ? getInitials(user.name) : '??'}
              </span>
            </div>
            <h2 className="text-xl font-semibold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
              {user?.name}
            </h2>
            <p className="text-[var(--color-text-muted)]">{user?.email}</p>

            <div className="mt-6 pt-6 border-t border-[var(--color-surface-border)]">
              <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-text-muted)]">
                <Calendar className="w-4 h-4" />
                <span>Membro desde {user?.createdAt ? formatDate(user.createdAt) : '-'}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[var(--color-bg-tertiary)]">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ArrowUpDown className="w-4 h-4 text-[var(--color-accent)]" />
                </div>
                <p className="text-2xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
                  {user?._count?.transactions || 0}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">Transações</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-bg-tertiary)]">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Tags className="w-4 h-4 text-[var(--color-accent)]" />
                </div>
                <p className="text-2xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
                  {user?._count?.categories || 0}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">Categorias</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--color-text-primary)] mb-6">
                Informações Pessoais
              </h3>

              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
                {profileSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-[var(--color-income)]/10 border border-[var(--color-income)]/20"
                  >
                    <p className="text-sm text-[var(--color-income)]">{profileSuccess}</p>
                  </motion.div>
                )}

                {profileError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-[var(--color-expense)]/10 border border-[var(--color-expense)]/20"
                  >
                    <p className="text-sm text-[var(--color-expense)]">{profileError}</p>
                  </motion.div>
                )}

                <Input
                  label="Nome"
                  type="text"
                  placeholder="Seu nome"
                  icon={<User className="w-5 h-5" />}
                  error={profileForm.formState.errors.name?.message}
                  {...profileForm.register('name')}
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="seu@email.com"
                  icon={<Mail className="w-5 h-5" />}
                  error={profileForm.formState.errors.email?.message}
                  {...profileForm.register('email')}
                />

                <Button type="submit" isLoading={isProfileLoading}>
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Password Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--color-text-primary)] mb-6">
                Alterar Senha
              </h3>

              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
                {passwordSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-[var(--color-income)]/10 border border-[var(--color-income)]/20"
                  >
                    <p className="text-sm text-[var(--color-income)]">{passwordSuccess}</p>
                  </motion.div>
                )}

                {passwordError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-[var(--color-expense)]/10 border border-[var(--color-expense)]/20"
                  >
                    <p className="text-sm text-[var(--color-expense)]">{passwordError}</p>
                  </motion.div>
                )}

                <Input
                  label="Senha Atual"
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock className="w-5 h-5" />}
                  error={passwordForm.formState.errors.currentPassword?.message}
                  {...passwordForm.register('currentPassword')}
                />

                <Input
                  label="Nova Senha"
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock className="w-5 h-5" />}
                  error={passwordForm.formState.errors.newPassword?.message}
                  {...passwordForm.register('newPassword')}
                />

                <Input
                  label="Confirmar Nova Senha"
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock className="w-5 h-5" />}
                  error={passwordForm.formState.errors.confirmPassword?.message}
                  {...passwordForm.register('confirmPassword')}
                />

                <Button type="submit" variant="secondary" isLoading={isPasswordLoading}>
                  <Lock className="w-4 h-4" />
                  Alterar Senha
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
