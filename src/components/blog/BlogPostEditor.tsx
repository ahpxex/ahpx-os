import { useState } from 'react'
import { useSetAtom } from 'jotai'
import { format } from 'date-fns'
import { createBlogPostAtom } from '@/store/blogActions'
import { TagInput } from './TagInput'

interface BlogPostEditorProps {
  onSave: () => void
  onCancel: () => void
}

export function BlogPostEditor({ onSave, onCancel }: BlogPostEditorProps) {
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [tags, setTags] = useState<string[]>([])
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(false)
  const [saving, setSaving] = useState(false)

  const createBlogPost = useSetAtom(createBlogPostAtom)

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Title is required')
      return
    }

    setSaving(true)
    try {
      await createBlogPost({
        title: title.trim(),
        summary: summary.trim(),
        date,
        tags,
        content,
        published,
      })
      onSave()
    } catch (error) {
      console.error('Failed to create blog post:', error)
      alert('Failed to create blog post. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className="w-full border border-[var(--color-border)] px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="mb-1 block text-sm font-medium">Summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief summary of the post"
              rows={2}
              className="w-full resize-none border border-[var(--color-border)] px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>

          {/* Date and Published */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-[var(--color-border)] px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <input
                type="checkbox"
                id="published"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="published" className="text-sm">
                Published
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1 block text-sm font-medium">Tags</label>
            <TagInput tags={tags} onChange={setTags} placeholder="Type tag and press Enter" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Content (Markdown)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here..."
              rows={12}
              className="w-full resize-none border border-[var(--color-border)] px-2 py-1 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-[var(--color-border)] bg-white p-2">
        <button
          onClick={onCancel}
          disabled={saving}
          className="border border-[var(--color-border)] bg-white px-3 py-1 text-sm hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="border border-[var(--color-primary)] bg-[var(--color-primary)] px-3 py-1 text-sm text-white hover:bg-[var(--color-primary-dark)]"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}
