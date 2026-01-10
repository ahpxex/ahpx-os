import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!isAuthenticated || !user) return null

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-6 w-6 min-h-0 min-w-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-primary)] p-0 text-xs font-bold text-white shadow-none"
      >
        {user.email?.[0].toUpperCase()}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 border border-[var(--color-border)] bg-white p-2 z-[2100]">
          <p className="truncate border-b pb-2 text-sm">{user.email}</p>
          <button
            type="button"
            onClick={() => {
              logout()
              setIsOpen(false)
            }}
            className="mt-2 w-full border border-[var(--color-border)] px-3 py-1 text-sm hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
