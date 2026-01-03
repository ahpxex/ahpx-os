import type { ReactNode } from 'react'
import type { Gadget } from '@/types/profile'

interface GadgetWrapperProps {
  gadget: Gadget
  isEditing?: boolean
  onDelete?: () => void
  children: ReactNode
}

export function GadgetWrapper({ gadget, isEditing, onDelete, children }: GadgetWrapperProps) {
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
            {gadget.type}
          </span>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-5 w-5 items-center justify-center bg-red-500 text-xs text-white hover:bg-red-600"
            title="Delete gadget"
          >
            x
          </button>
        </div>
      )}
      {children}
    </div>
  )
}
