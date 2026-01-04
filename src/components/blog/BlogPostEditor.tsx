import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useSetAtom } from 'jotai'
import { format } from 'date-fns'
import { createBlogPostAtom, updateBlogPostAtom } from '@/store/blogActions'
import { useToast } from '@/contexts/ToastContext'
import { TagInput } from './TagInput'
import type { BlogPost } from '@/types/database'

interface BlogPostEditorProps {
  post?: BlogPost
  onSave: () => void
  onCancel: () => void
}

export function BlogPostEditor({ post, onSave, onCancel }: BlogPostEditorProps) {
  const isEditing = !!post

  const [title, setTitle] = useState(post?.title || '')
  const [summary, setSummary] = useState(post?.summary || '')
  const [date, setDate] = useState(post?.date || format(new Date(), 'yyyy-MM-dd'))
  const [tags, setTags] = useState<string[]>(post?.tags || [])
  const [content, setContent] = useState(
    typeof post?.content === 'string' ? post.content : ''
  )
  const [published, setPublished] = useState(post?.published || false)
  const [saving, setSaving] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const createBlogPost = useSetAtom(createBlogPostAtom)
  const updateBlogPost = useSetAtom(updateBlogPostAtom)
  const toast = useToast()

  const handleSave = async () => {
    if (!title.trim()) {
      toast.warning('Title is required')
      return
    }

    setSaving(true)
    try {
      if (isEditing && post) {
        await updateBlogPost({
          id: post.id,
          updates: {
            title: title.trim(),
            summary: summary.trim(),
            date,
            tags,
            content,
            published,
          },
        })
        toast.success('Post updated successfully')
      } else {
        await createBlogPost({
          title: title.trim(),
          summary: summary.trim(),
          date,
          tags,
          content,
          published,
        })
        toast.success('Post created successfully')
      }
      onSave()
    } catch (error) {
      console.error('Failed to save blog post:', error)
      toast.error(isEditing ? 'Failed to update post' : 'Failed to create post')
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
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium">Content (Markdown)</label>
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="text-xs text-[var(--color-primary)] hover:underline"
              >
                Fullscreen
              </button>
            </div>
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
          {saving ? 'Saving...' : isEditing ? 'Update' : 'Save'}
        </button>
      </div>

      {isFullscreen && createPortal(
        <div className="fixed inset-0 z-[2500] flex flex-col bg-white">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2">
            <span className="text-sm font-medium">Content Editor (Fullscreen)</span>
            <button
              onClick={() => setIsFullscreen(false)}
              className="border border-[var(--color-border)] bg-white px-3 py-1 text-sm hover:bg-gray-100"
            >
              Exit Fullscreen
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content here..."
            className="flex-1 resize-none border-0 p-4 font-mono text-sm focus:outline-none"
          />
        </div>,
        document.body
      )}
    </div>
  )
}
