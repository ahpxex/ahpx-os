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
      aria-label="Start"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      className={`xp-reset-button xp-start-button-luna min-h-0 min-w-0 m-0 flex h-full w-[96px] items-center justify-start rounded-r-[6px] rounded-l-none p-0 text-white ${className}`}
      {...props}
    >
      <span className="sr-only">Start</span>
    </button>
  )
})
