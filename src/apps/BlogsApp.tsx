interface BlogPost {
  title: string
  date: string
  excerpt: string
}

const posts: BlogPost[] = [
  {
    title: 'Building a Web OS',
    date: '2024-01-15',
    excerpt: 'How I built this macOS-inspired web interface using React and TypeScript.',
  },
  {
    title: 'The Art of Minimalism',
    date: '2024-01-10',
    excerpt: 'Thoughts on keeping things simple in software development.',
  },
  {
    title: 'React 19 First Impressions',
    date: '2024-01-05',
    excerpt: 'Exploring the new features and improvements in React 19.',
  },
]

export function BlogsApp() {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Blogs</h1>

      <div className="space-y-4">
        {posts.map((post) => (
          <article
            key={post.title}
            className="border border-[var(--color-border)] bg-white p-4 transition-all hover:bg-[var(--color-primary-bg)] cursor-pointer"
          >
            <time className="text-xs text-gray-500">{post.date}</time>
            <h2 className="text-lg font-bold mt-1">{post.title}</h2>
            <p className="mt-2 text-gray-700 text-sm">{post.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
