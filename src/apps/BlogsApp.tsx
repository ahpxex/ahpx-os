import { useState, useEffect, useMemo, useRef } from 'react'
import { useBlogPosts } from '@/hooks/useBlogPosts'
import { useAuth } from '@/hooks/useAuth'
import { useWindowContextMenu } from '@/contexts/WindowContextMenuContext'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { BlogPostEditor } from '@/components/blog/BlogPostEditor'
import { BlogPostView } from '@/components/blog/BlogPostView'
import { BlogSearch } from '@/components/blog/BlogSearch'
import { BlogTagFilter } from '@/components/blog/BlogTagFilter'
import { format } from 'date-fns'
import type { BlogPost } from '@/types/database'

export function BlogsApp() {
  const { posts, loading, refetch } = useBlogPosts()
  const { isAuthenticated } = useAuth()
  const { setContextMenuItems, clearContextMenuItems } = useWindowContextMenu()

  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [viewingPost, setViewingPost] = useState<BlogPost | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Track scroll position for restoration
  const scrollRef = useRef<HTMLDivElement>(null)
  const savedScrollPosition = useRef(0)

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
    if (isAuthenticated && !isCreating && !editingPost && !viewingPost) {
      setContextMenuItems([
        {
          label: 'Create Post',
          onClick: () => setIsCreating(true),
        },
      ])
    } else {
      clearContextMenuItems()
    }

    return () => {
      clearContextMenuItems()
    }
  }, [isAuthenticated, isCreating, editingPost, viewingPost, setContextMenuItems, clearContextMenuItems])

  // Handle opening a post
  const handleOpenPost = (post: BlogPost) => {
    // Save scroll position before navigating
    if (scrollRef.current) {
      savedScrollPosition.current = scrollRef.current.scrollTop
    }
    setViewingPost(post)
  }

  // Handle going back to list
  const handleBackToList = () => {
    setViewingPost(null)
    // Restore scroll position after render
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = savedScrollPosition.current
      }
    })
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Handle editing a post from view
  const handleEditPost = () => {
    if (viewingPost) {
      setEditingPost(viewingPost)
      setViewingPost(null)
    }
  }

  if (isCreating) {
    return (
      <BlogPostEditor
        onSave={() => {
          setIsCreating(false)
          refetch()
        }}
        onCancel={() => setIsCreating(false)}
      />
    )
  }

  if (editingPost) {
    return (
      <BlogPostEditor
        post={editingPost}
        onSave={() => {
          setEditingPost(null)
          refetch()
        }}
        onCancel={() => setEditingPost(null)}
      />
    )
  }

  if (viewingPost) {
    return (
      <BlogPostView
        post={viewingPost}
        onBack={handleBackToList}
        onEdit={handleEditPost}
        canEdit={isAuthenticated}
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
      <div ref={scrollRef} className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <p className="text-gray-500">
              {posts.length === 0 ? 'No blog posts yet.' : 'No posts match your search.'}
            </p>
          ) : (
            filteredPosts.map((post) => (
              <article
                key={post.id}
                onClick={() => handleOpenPost(post)}
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
