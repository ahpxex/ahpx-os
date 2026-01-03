import ReactMarkdown from 'react-markdown'
import type { TextGadget as TextGadgetType } from '@/types/profile'

interface TextGadgetProps {
  gadget: TextGadgetType
  isEditing?: boolean
  onContentChange?: (content: string) => void
}

export function TextGadget({ gadget, isEditing, onContentChange }: TextGadgetProps) {
  if (isEditing) {
    return (
      <textarea
        className="h-full w-full resize-none border-0 bg-transparent p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
        value={gadget.content}
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
        {gadget.content || ''}
      </ReactMarkdown>
    </div>
  )
}
