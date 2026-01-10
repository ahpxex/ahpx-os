import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastData {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastProps {
  toast: ToastData
  onDismiss: (id: string) => void
}

const typeStyles: Record<ToastType, string> = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-[var(--color-primary)] text-white',
  warning: 'bg-yellow-500 text-black',
}

const typeIcons: Record<ToastType, string> = {
  success: '[ok]',
  error: '[!]',
  info: '[i]',
  warning: '[!]',
}

function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id)
    }, toast.duration || 4000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onDismiss])

  return (
    <div
      className={`flex items-center gap-2 border border-black px-3 py-2 text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${typeStyles[toast.type]}`}
    >
      <span className="font-mono text-xs">{typeIcons[toast.type]}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="ml-2 min-h-0 min-w-0 border-0 bg-transparent p-0 shadow-none opacity-70 hover:opacity-100"
      >
        x
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastData[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return createPortal(
    <div className="fixed top-4 right-4 z-[3000] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  )
}
