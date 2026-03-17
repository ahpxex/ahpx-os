import { Suspense, lazy, useEffect, useMemo, useRef } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { useNavigate } from '@tanstack/react-router'
import { useWindowContextMenu } from '@/contexts/WindowContextMenuContext'
import { useToast } from '@/contexts/ToastContext'
import { useDialog } from '@/contexts/DialogContext'
import { useLocalAtom } from '@/hooks/useLocalAtom'
import { blogPostsAtom } from '@/store/appAtoms'
import { deleteBlogPostAtom } from '@/store/blogActions'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { BlogSearch } from '@/components/blog/BlogSearch'
import { BlogTagFilter } from '@/components/blog/BlogTagFilter'
import { titleToUrl, urlToTitle } from '@/lib/urlHelpers'
import { format } from 'date-fns'
import type { BlogPost } from '@/types/database'

const BlogPostEditor = lazy(async () => {
  const module = await import('@/components/blog/BlogPostEditor')
  return { default: module.BlogPostEditor }
})

const BlogPostView = lazy(async () => {
  const module = await import('@/components/blog/BlogPostView')
  return { default: module.BlogPostView }
})

interface BlogsAppState {
  editingPost: BlogPost | null
  isCreating: boolean
  viewingPost: BlogPost | null
  searchQuery: string
  selectedTag: string | null
}

function BlogPanelFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <LoadingSpinner />
    </div>
  )
}

export function BlogsApp() {
  const posts = useAtomValue(blogPostsAtom)
  const { setContextMenuItems, clearContextMenuItems } = useWindowContextMenu()
  const deleteBlogPost = useSetAtom(deleteBlogPostAtom)
  const toast = useToast()
  const dialog = useDialog()
  const navigate = useNavigate()
  const [viewState, setViewState] = useLocalAtom<BlogsAppState>(
    () => ({
      editingPost: null,
      isCreating: false,
      viewingPost: null,
      searchQuery: '',
      selectedTag: null,
    }),
    []
  )

  const { editingPost, isCreating, viewingPost, searchQuery, selectedTag } = viewState
  const scrollRef = useRef<HTMLDivElement>(null)
  const initialIdentifier = sessionStorage.getItem('initialPostIdentifier')

  const pendingViewingPost = useMemo(() => {
    if (!initialIdentifier || viewingPost) return null

    const searchTitle = urlToTitle(initialIdentifier)
    return (
      posts.find((entry) => urlToTitle(titleToUrl(entry.title)) === searchTitle) ||
      posts.find((entry) => entry.slug === initialIdentifier) ||
      null
    )
  }, [initialIdentifier, posts, viewingPost])

  useEffect(() => {
    if (pendingViewingPost) {
      sessionStorage.removeItem('initialPostIdentifier')
    }
  }, [pendingViewingPost])

  const activeViewingPost = viewingPost ?? pendingViewingPost

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    posts.forEach((post) => post.tags.forEach((tag) => tagSet.add(tag)))
    return Array.from(tagSet).sort()
  }, [posts])

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTag = !selectedTag || post.tags.includes(selectedTag)

      return matchesSearch && matchesTag
    })
  }, [posts, searchQuery, selectedTag])

  useEffect(() => {
    if (!isCreating && !editingPost && !activeViewingPost) {
      setContextMenuItems([
        {
          label: 'Create Post',
          onClick: () => setViewState((prev) => ({ ...prev, isCreating: true })),
        },
      ])
    } else {
      clearContextMenuItems()
    }

    return () => {
      clearContextMenuItems()
    }
  }, [isCreating, editingPost, activeViewingPost, setContextMenuItems, clearContextMenuItems, setViewState])

  const handleOpenPost = (post: BlogPost) => {
    const urlIdentifier = titleToUrl(post.title)
    navigate({ to: '/blog/$postSlug', params: { postSlug: urlIdentifier } })
  }

  const handleBackToList = () => {
    navigate({ to: '/' })
  }

  const handleEditPost = () => {
    if (!activeViewingPost) return

    setViewState((prev) => ({
      ...prev,
      editingPost: activeViewingPost,
      viewingPost: null,
    }))
  }

  const handleDeletePost = async () => {
    if (!activeViewingPost) return

    const confirmed = await dialog.confirm(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.'
    )
    if (!confirmed) return

    try {
      await deleteBlogPost(activeViewingPost.id)
      toast.success('Post deleted successfully')
      navigate({ to: '/' })
    } catch (error) {
      console.error('Failed to delete post:', error)
      toast.error('Failed to delete post')
    }
  }

  if (isCreating) {
    return (
      <Suspense fallback={<BlogPanelFallback />}>
        <BlogPostEditor
          onSave={() => {
            setViewState((prev) => ({ ...prev, isCreating: false }))
          }}
          onCancel={() => setViewState((prev) => ({ ...prev, isCreating: false }))}
        />
      </Suspense>
    )
  }

  if (editingPost) {
    return (
      <Suspense fallback={<BlogPanelFallback />}>
        <BlogPostEditor
          post={editingPost}
          onSave={() => {
            setViewState((prev) => ({ ...prev, editingPost: null }))
          }}
          onCancel={() => setViewState((prev) => ({ ...prev, editingPost: null }))}
        />
      </Suspense>
    )
  }

  if (activeViewingPost) {
    return (
      <Suspense fallback={<BlogPanelFallback />}>
        <BlogPostView
          post={activeViewingPost}
          onBack={handleBackToList}
          onEdit={handleEditPost}
          onDelete={handleDeletePost}
          canEdit
        />
      </Suspense>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--color-border)] p-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold">Blogs</h1>
          <BlogSearch
            value={searchQuery}
            onChange={(value) => setViewState((prev) => ({ ...prev, searchQuery: value }))}
          />
        </div>

        {allTags.length > 0 && (
          <div className="mt-3">
            <BlogTagFilter
              tags={allTags}
              selectedTag={selectedTag}
              onSelectTag={(tag) => setViewState((prev) => ({ ...prev, selectedTag: tag }))}
            />
          </div>
        )}
      </div>

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
