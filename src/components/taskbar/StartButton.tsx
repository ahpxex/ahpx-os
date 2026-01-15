import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef } from 'react'

interface StartButtonProps extends Omit<ComponentPropsWithoutRef<'button'>, 'type'> {
  isOpen: boolean
}

export const StartButton = forwardRef<HTMLButtonElement, StartButtonProps>(function StartButton(
  { isOpen, className = '', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      className={`xp-reset-button xp-start-button-luna min-h-0 min-w-0 m-0 flex h-full w-[96px] items-center justify-start rounded-r-[10px] rounded-l-none border border-black/35 border-l-0 p-0 text-white hover:brightness-[1.03] active:brightness-[0.98] ${className}`}
      {...props}
    >
      <div className="flex items-center gap-1 pl-2 pr-4">
        <img src="/places/distributor-logo.png" alt="" className="h-5 w-5" draggable={false} />
        <span
          className="text-[13px] font-bold italic leading-none tracking-wide"
          style={{ textShadow: '1px 1px 0 rgba(0, 0, 0, 0.45)' }}
        >
          start
        </span>
      </div>
    </button>
  )
})
