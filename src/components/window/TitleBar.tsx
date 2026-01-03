import { TrafficLights } from './TrafficLights'
import type { WindowState } from '@/types/window'

interface TitleBarProps {
  window: WindowState
}

export function TitleBar({ window }: TitleBarProps) {
  return (
    <div className="window-drag-handle flex h-8 shrink-0 cursor-grab items-center bg-[#f5f5f5] px-2 active:cursor-grabbing">
      <TrafficLights windowId={window.id} />
      <span className="flex-1 text-center text-sm font-medium">
        {window.title}
      </span>
      <div className="w-14" />
    </div>
  )
}
