import type { ImageWidget as ImageWidgetType } from '@/types/profile'

interface ImageWidgetProps {
  widget: ImageWidgetType
  isEditing?: boolean
  onUrlChange?: (url: string) => void
}

export function ImageWidget({ widget, isEditing, onUrlChange }: ImageWidgetProps) {
  if (isEditing && !widget.url) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed border-gray-300 bg-gray-50 p-4">
        <input
          type="text"
          className="w-full border border-gray-300 px-2 py-1 text-sm"
          placeholder="Enter image URL..."
          value={widget.url}
          onChange={(e) => onUrlChange?.(e.target.value)}
        />
        <p className="text-xs text-gray-500">Paste an image URL</p>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {widget.url ? (
        <>
          <img
            src={widget.url}
            alt={widget.alt || ''}
            className="h-full w-full object-cover"
          />
          {widget.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-xs text-white">
              {widget.caption}
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
