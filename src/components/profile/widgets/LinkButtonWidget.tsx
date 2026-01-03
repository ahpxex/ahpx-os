import type { LinkButtonWidget as LinkButtonWidgetType } from '@/types/profile'

interface LinkButtonWidgetProps {
  widget: LinkButtonWidgetType
  isEditing?: boolean
  onLabelChange?: (label: string) => void
  onUrlChange?: (url: string) => void
}

export function LinkButtonWidget({
  widget,
  isEditing,
  onLabelChange,
  onUrlChange,
}: LinkButtonWidgetProps) {
  const variant = widget.variant || 'primary'

  const variantStyles = {
    primary:
      'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] border-[var(--color-primary)]',
    secondary:
      'bg-[var(--color-primary-bg)] text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] border-[var(--color-border)]',
    outline:
      'bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] border-[var(--color-border)]',
  }

  if (isEditing) {
    return (
      <div className="flex h-full w-full flex-col justify-center gap-1 p-2">
        <input
          type="text"
          className="w-full border border-gray-300 px-2 py-1 text-sm"
          placeholder="Button label"
          value={widget.label}
          onChange={(e) => onLabelChange?.(e.target.value)}
        />
        <input
          type="text"
          className="w-full border border-gray-300 px-2 py-1 text-sm"
          placeholder="URL"
          value={widget.url}
          onChange={(e) => onUrlChange?.(e.target.value)}
        />
      </div>
    )
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-2">
      <a
        href={widget.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center gap-2 border px-4 py-2 text-sm font-medium transition-colors ${variantStyles[variant]}`}
      >
        {widget.icon && (
          <img src={widget.icon} alt="" className="h-4 w-4" />
        )}
        {widget.label}
      </a>
    </div>
  )
}
