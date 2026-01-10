import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { Desktop } from '@/components/desktop/Desktop'
import { Taskbar } from '@/components/taskbar/Taskbar'
import { useOS } from '@/hooks/useOS'

export const Route = createFileRoute('/blog/$postSlug')({
  component: BlogPostPage,
  beforeLoad: ({ params }) => {
    // Store the post identifier in sessionStorage so BlogsApp can access it
    sessionStorage.setItem('initialPostIdentifier', params.postSlug)
  },
})

function BlogPostPage() {
  const { windows } = useOS()
  const navigate = useNavigate()
  const blogWindowWasOpen = useRef(false)

  // Watch for blog window being closed and redirect to home
  useEffect(() => {
    const blogWindow = windows.find((w) => w.id === 'blogs')

    // Track if blog window has been opened
    if (blogWindow) {
      blogWindowWasOpen.current = true
    }

    // If blog window was open and is now closed, navigate to home
    if (!blogWindow && blogWindowWasOpen.current) {
      navigate({ to: '/' })
    }
  }, [windows, navigate])

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <main className="relative flex-1">
        <Desktop initialOpenApp="blogs" />
      </main>
      <Taskbar />
    </div>
  )
}
