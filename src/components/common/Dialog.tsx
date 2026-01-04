import { createPortal } from 'react-dom'

export interface DialogAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'danger' | 'secondary'
}

export interface DialogProps {
  title: string
  message: string
  actions: DialogAction[]
  onClose: () => void
}

export function Dialog({ title, message, actions, onClose }: DialogProps) {
  const getButtonClasses = (variant: DialogAction['variant'] = 'secondary') => {
    const base = 'px-4 py-1.5 text-sm border'
    switch (variant) {
      case 'primary':
        return `${base} border-[var(--color-primary)] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]`
      case 'danger':
        return `${base} border-red-500 bg-red-500 text-white hover:bg-red-600`
      case 'secondary':
      default:
        return `${base} border-[var(--color-border)] bg-white hover:bg-gray-100`
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md border-2 border-[var(--color-border)] bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={getButtonClasses(action.variant)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}
