import type { ComponentPropsWithoutRef } from 'react'

interface StartButtonProps extends Omit<ComponentPropsWithoutRef<'button'>, 'type'> {
  isOpen: boolean
}

export function StartButton({ isOpen, className = '', ...props }: StartButtonProps) {
  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      className={`xp-reset-button min-h-0 min-w-0 m-0 flex h-full items-center justify-start rounded-r-full rounded-l-none border border-black/35 bg-[#62aa52] p-0 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] hover:brightness-[1.03] active:brightness-[0.98] active:!shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] ${className}`}
      {...props}
    >
      <div className="flex items-center gap-1 pl-2 pr-4">
        <img src="/places/distributor-logo.png" alt="" className="h-5 w-5" draggable={false} />
        <span className="text-[13px] font-bold italic leading-none tracking-wide drop-shadow-[0_1px_0_rgba(0,0,0,0.55)]">
          start
        </span>
      </div>
    </button>
  )
}

