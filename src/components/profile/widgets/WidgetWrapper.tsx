import type { ReactNode } from 'react'
import type { Widget } from '@/types/profile'

interface WidgetWrapperProps {
  widget: Widget
  isEditing?: boolean
  onDelete?: () => void
  children: ReactNode
}

export function WidgetWrapper({ widget, isEditing, onDelete, children }: WidgetWrapperProps) {
  return (
    <div
      className={`relative h-full w-full overflow-hidden border bg-white ${
        isEditing
          ? 'border-[var(--color-primary)] border-dashed'
          : 'border-[var(--color-border)]'
      }`}
    >
      {isEditing && (
        <div className="absolute right-1 top-1 z-10 flex gap-1">
          <span className="bg-gray-100 px-1 text-xs text-gray-500">
            {widget.type}
          </span>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-5 w-5 min-h-0 min-w-0 items-center justify-center border-0 bg-red-500 p-0 text-xs text-white shadow-none hover:bg-red-600"
            title="Delete widget"
          >
            x
          </button>
        </div>
      )}
      {children}
    </div>
  )
}
