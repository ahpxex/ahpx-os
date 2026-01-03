import { Clock } from './Clock'

export function TopBar() {
  return (
    <header className="z-[1000] flex h-10 w-full shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-white px-4">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold">ahpx-os</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <Clock />
      </div>
    </header>
  )
}
