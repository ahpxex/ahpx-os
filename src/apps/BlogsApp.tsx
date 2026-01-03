import { useBlogPosts } from '@/hooks/useBlogPosts'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { format } from 'date-fns'

export function BlogsApp() {
  const { posts, loading, refetch } = useBlogPosts()

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Blogs</h1>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-gray-500">No blog posts yet.</p>
        ) : (
          posts.map((post) => (
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
  )
}
