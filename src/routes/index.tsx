import { createFileRoute } from '@tanstack/react-router'
import { TopBar } from '@/components/topbar/TopBar'
import { Desktop } from '@/components/desktop/Desktop'

export const Route = createFileRoute('/')({
  component: OSHome,
})

function OSHome() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <TopBar />
      <main className="relative flex-1">
        <Desktop />
      </main>
    </div>
  )
}
