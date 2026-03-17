/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { ToastContainer, type ToastData, type ToastType } from '@/components/common/Toast'
import { useLocalAtom } from '@/hooks/useLocalAtom'

interface ToastContextValue {
  showToast: (type: ToastType, message: string, duration?: number) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let toastId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useLocalAtom<ToastData[]>(() => [], [])

  const showToast = useCallback(
    (type: ToastType, message: string, duration?: number) => {
      const id = `toast-${++toastId}`
      setToasts((prev) => [...prev, { id, type, message, duration }])
    },
    [setToasts]
  )

  const dismissToast = useCallback(
    (id: string) => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    },
    [setToasts]
  )

  const success = useCallback((message: string) => showToast('success', message), [showToast])
  const error = useCallback((message: string) => showToast('error', message), [showToast])
  const info = useCallback((message: string) => showToast('info', message), [showToast])
  const warning = useCallback((message: string) => showToast('warning', message), [showToast])

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
