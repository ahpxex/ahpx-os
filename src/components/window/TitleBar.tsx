import { TrafficLights } from './TrafficLights'
import type { WindowState } from '@/types/window'

interface TitleBarProps {
  window: WindowState
  onDragStart: (e: React.MouseEvent) => void
}

export function TitleBar({ window, onDragStart }: TitleBarProps) {
  return (
    <div
      className="flex h-8 shrink-0 cursor-grab items-center border-b-2 border-black bg-[#f5f5f5] px-2 active:cursor-grabbing"
      onMouseDown={onDragStart}
    >
      <TrafficLights windowId={window.id} />
      <span className="flex-1 text-center text-sm font-medium">
        {window.title}
      </span>
      <div className="w-14" />
    </div>
  )
}
