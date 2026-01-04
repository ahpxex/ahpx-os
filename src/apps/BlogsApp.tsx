import { useState, useEffect, useMemo } from 'react'
import { useBlogPosts } from '@/hooks/useBlogPosts'
import { useAuth } from '@/hooks/useAuth'
import { useWindowContextMenu } from '@/contexts/WindowContextMenuContext'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { BlogPostEditor } from '@/components/blog/BlogPostEditor'
import { BlogSearch } from '@/components/blog/BlogSearch'
import { BlogTagFilter } from '@/components/blog/BlogTagFilter'
import { format } from 'date-fns'

export function BlogsApp() {
  const { posts, loading, refetch } = useBlogPosts()
  const { isAuthenticated } = useAuth()
  const { setContextMenuItems, clearContextMenuItems } = useWindowContextMenu()

  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Get all unique tags from posts
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    posts.forEach((post) => post.tags.forEach((tag) => tagSet.add(tag)))
    return Array.from(tagSet).sort()
  }, [posts])

  // Filter posts by search and tag
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchQuery.toLowerCase())

      // Tag filter
      const matchesTag = !selectedTag || post.tags.includes(selectedTag)

      return matchesSearch && matchesTag
    })
  }, [posts, searchQuery, selectedTag])

  // Set up context menu
  useEffect(() => {
    if (isAuthenticated && !isEditing) {
      setContextMenuItems([
        {
          label: 'Create Post',
          onClick: () => setIsEditing(true),
        },
      ])
    } else {
      clearContextMenuItems()
    }

    return () => {
      clearContextMenuItems()
    }
  }, [isAuthenticated, isEditing, setContextMenuItems, clearContextMenuItems])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isEditing) {
    return (
      <BlogPostEditor
        onSave={() => {
          setIsEditing(false)
          refetch()
        }}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header with search and filters */}
      <div className="border-b border-[var(--color-border)] p-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold">Blogs</h1>
          <BlogSearch value={searchQuery} onChange={setSearchQuery} />
        </div>

        {allTags.length > 0 && (
          <div className="mt-3">
            <BlogTagFilter
              tags={allTags}
              selectedTag={selectedTag}
              onSelectTag={setSelectedTag}
            />
          </div>
        )}
      </div>

      {/* Post list */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <p className="text-gray-500">
              {posts.length === 0 ? 'No blog posts yet.' : 'No posts match your search.'}
            </p>
          ) : (
            filteredPosts.map((post) => (
              <article
                key={post.id}
                className="cursor-pointer border border-[var(--color-border)] bg-white p-4 transition-all hover:bg-[var(--color-primary-bg)]"
              >
                <time className="text-xs text-gray-500">
                  {format(new Date(post.date), 'MMM dd, yyyy')}
                </time>
                <h2 className="mt-1 text-lg font-bold">{post.title}</h2>
                <p className="mt-2 text-sm text-gray-700">{post.summary}</p>

                {post.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-[var(--color-primary-bg)] px-2 py-0.5 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
