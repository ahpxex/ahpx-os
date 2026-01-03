import type { ImageGadget as ImageGadgetType } from '@/types/profile'

interface ImageGadgetProps {
  gadget: ImageGadgetType
  isEditing?: boolean
  onUrlChange?: (url: string) => void
}

export function ImageGadget({ gadget, isEditing, onUrlChange }: ImageGadgetProps) {
  if (isEditing && !gadget.url) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed border-gray-300 bg-gray-50 p-4">
        <input
          type="text"
          className="w-full border border-gray-300 px-2 py-1 text-sm"
          placeholder="Enter image URL..."
          value={gadget.url}
          onChange={(e) => onUrlChange?.(e.target.value)}
        />
        <p className="text-xs text-gray-500">Paste an image URL</p>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {gadget.url ? (
        <>
          <img
            src={gadget.url}
            alt={gadget.alt || ''}
            className="h-full w-full object-cover"
          />
          {gadget.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-xs text-white">
              {gadget.caption}
            </div>
          )}
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
          No image
        </div>
      )}
    </div>
  )
}
