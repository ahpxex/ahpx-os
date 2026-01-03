import ReactMarkdown from 'react-markdown'
import type { TextWidget as TextWidgetType } from '@/types/profile'

interface TextWidgetProps {
  widget: TextWidgetType
  isEditing?: boolean
  onContentChange?: (content: string) => void
}

export function TextWidget({ widget, isEditing, onContentChange }: TextWidgetProps) {
  if (isEditing) {
    return (
      <textarea
        className="h-full w-full resize-none border-0 bg-transparent p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
        value={widget.content}
        onChange={(e) => onContentChange?.(e.target.value)}
        placeholder="Enter markdown content..."
      />
    )
  }

  return (
    <div className="prose prose-sm h-full w-full overflow-auto p-2">
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary)] hover:underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {widget.content || ''}
      </ReactMarkdown>
    </div>
  )
}
