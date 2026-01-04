import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { format } from 'date-fns'
import type { BlogPost } from '@/types/database'

interface BlogPostViewProps {
  post: BlogPost
  onBack: () => void
  onEdit?: () => void
  canEdit?: boolean
}

export function BlogPostView({ post, onBack, onEdit, canEdit }: BlogPostViewProps) {
  // Content is stored as JSON, could be string or object
  const content = typeof post.content === 'string' ? post.content : ''

  return (
    <div className="flex h-full flex-col">
      {/* Header with back button and edit button */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
        <button
          onClick={onBack}
          className="text-sm text-[var(--color-primary)] hover:underline"
        >
          &larr; Back to posts
        </button>
        {canEdit && onEdit && (
          <button
            onClick={onEdit}
            className="border border-[var(--color-border)] bg-white px-3 py-1 text-sm hover:bg-gray-100"
          >
            Edit
          </button>
        )}
      </div>

      {/* Post content */}
      <div className="flex-1 overflow-auto p-4">
        <article className="mx-auto max-w-2xl">
          {/* Meta */}
          <time className="text-sm text-gray-500">
            {format(new Date(post.date), 'MMMM dd, yyyy')}
          </time>

          {/* Title */}
          <h1 className="mt-2 text-2xl font-bold selectable">{post.title}</h1>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[var(--color-primary-bg)] px-2 py-0.5 text-xs text-[var(--color-primary)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Summary */}
          {post.summary && (
            <p className="mt-4 text-gray-600 italic selectable">{post.summary}</p>
          )}

          {/* Content */}
          <div className="prose prose-sm mt-6 max-w-none selectable">
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
                h1: ({ children }) => (
                  <h1 className="mt-6 mb-4 text-xl font-bold">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="mt-5 mb-3 text-lg font-bold">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mt-4 mb-2 text-base font-bold">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="my-3 leading-relaxed">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="my-3 list-disc pl-6">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="my-3 list-decimal pl-6">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="my-1">{children}</li>
                ),
                code: ({ className, children }) => {
                  const match = /language-(\w+)/.exec(className || '')
                  const codeString = String(children).replace(/\n$/, '')

                  if (match) {
                    return (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: '4px',
                          fontSize: '13px',
                        }}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    )
                  }

                  // Inline code
                  return (
                    <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm">
                      {children}
                    </code>
                  )
                },
                pre: ({ children }) => (
                  <div className="my-4 overflow-hidden rounded">
                    {children}
                  </div>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="my-4 border-l-4 border-[var(--color-primary)] pl-4 italic text-gray-600">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  )
}
