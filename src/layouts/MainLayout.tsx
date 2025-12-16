import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  ArrowUpDown,
  Tags,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Wallet,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn, getInitials } from '@/lib/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowUpDown, label: 'Transações' },
  { to: '/categories', icon: Tags, label: 'Categorias' },
  { to: '/reports', icon: BarChart3, label: 'Relatórios' },
  { to: '/profile', icon: User, label: 'Perfil' },
]

export function MainLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-[var(--color-bg-secondary)] border-r border-[var(--color-surface-border)]">
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)]">
              <Wallet className="w-6 h-6 text-[var(--color-text-inverse)]" />
            </div>
            <span className="text-xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
              Financy
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      `flex items-center gap-3 px-4 py-3 rounded-lg
                      text-sm font-medium transition-all duration-200
                      group relative`,
                      isActive
                        ? 'text-[var(--color-text-primary)] bg-[var(--color-bg-tertiary)]'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]/50'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[var(--color-accent)]"
                        />
                      )}
                      <item.icon className={cn(
                        'w-5 h-5 transition-colors',
                        isActive && 'text-[var(--color-accent)]'
                      )} />
                      <span>{item.label}</span>
                      {isActive && (
                        <ChevronRight className="w-4 h-4 ml-auto text-[var(--color-text-muted)]" />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-[var(--color-surface-border)]">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-tertiary)]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] flex items-center justify-center">
              <span className="text-sm font-semibold text-[var(--color-text-inverse)]">
                {user ? getInitials(user.name) : '??'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                {user?.name}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-expense)] hover:bg-[var(--color-expense)]/10 transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[var(--color-bg-secondary)]/95 backdrop-blur-lg border-b border-[var(--color-surface-border)]">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)]">
              <Wallet className="w-5 h-5 text-[var(--color-text-inverse)]" />
            </div>
            <span className="text-lg font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
              Financy
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed right-0 top-0 bottom-0 z-50 w-72 bg-[var(--color-bg-secondary)] border-l border-[var(--color-surface-border)]"
            >
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-surface-border)]">
                <span className="font-semibold text-[var(--color-text-primary)]">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="p-3">
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            `flex items-center gap-3 px-4 py-3 rounded-lg
                            text-sm font-medium transition-all`,
                            isActive
                              ? 'text-[var(--color-text-primary)] bg-[var(--color-bg-tertiary)]'
                              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)]/50'
                          )
                        }
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--color-surface-border)]">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-[var(--color-expense)] hover:bg-[var(--color-expense)]/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sair</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="pt-16 lg:pt-0 min-h-screen overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
