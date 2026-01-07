import { createFileRoute } from '@tanstack/react-router'
import { TopBar } from '@/components/topbar/TopBar'
import { Desktop } from '@/components/desktop/Desktop'

export const Route = createFileRoute('/blog/$postSlug')({
  component: BlogPostPage,
  beforeLoad: ({ params }) => {
    // Store the post identifier in sessionStorage so BlogsApp can access it
    sessionStorage.setItem('initialPostIdentifier', params.postSlug)
  },
})

function BlogPostPage() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <TopBar />
      <main className="relative flex-1">
        <Desktop initialOpenApp="blogs" />
      </main>
    </div>
  )
}
