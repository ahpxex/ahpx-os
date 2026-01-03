import { useOS } from '@/hooks/useOS'

interface TrafficLightsProps {
  windowId: string
}

export function TrafficLights({ windowId }: TrafficLightsProps) {
  const { closeWindow, minimizeWindow, toggleMaximizeWindow } = useOS()

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    closeWindow(windowId)
  }

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation()
    minimizeWindow(windowId)
  }

  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleMaximizeWindow(windowId)
  }

  return (
    <div className="flex gap-1.5" onMouseDown={(e) => e.stopPropagation()}>
      <button
        className="h-3 w-3 rounded-full border border-[var(--color-border)] bg-red-500 hover:bg-red-600"
        onClick={handleClose}
        aria-label="Close window"
      />
      <button
        className="h-3 w-3 rounded-full border border-[var(--color-border)] bg-yellow-500 hover:bg-yellow-600"
        onClick={handleMinimize}
        aria-label="Minimize window"
      />
      <button
        className="h-3 w-3 rounded-full border border-[var(--color-border)] bg-green-500 hover:bg-green-600"
        onClick={handleMaximize}
        aria-label="Maximize window"
      />
    </div>
  )
}
