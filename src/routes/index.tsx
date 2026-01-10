import { createFileRoute } from '@tanstack/react-router'
import { Desktop } from '@/components/desktop/Desktop'
import { Taskbar } from '@/components/taskbar/Taskbar'

export const Route = createFileRoute('/')({
  component: OSHome,
})

function OSHome() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <main className="relative flex-1">
        <Desktop />
      </main>
      <Taskbar />
    </div>
  )
}
