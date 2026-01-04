import { useMemo, useRef, useCallback, useState } from 'react'
import ReactGridLayout, { useContainerWidth, getCompactor } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import type { Widget, ProfileLayout } from '@/types/profile'
import { TextWidget, ImageWidget, LinkButtonWidget, WidgetWrapper } from './widgets'

interface LayoutItem {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
}

interface WidgetGridProps {
  widgets: Widget[]
  layout: ProfileLayout
  isEditing?: boolean
  onLayoutChange?: (layout: LayoutItem[]) => void
  onWidgetUpdate?: (widgetId: string, updates: Partial<Widget>) => void
  onWidgetDelete?: (widgetId: string) => void
}

// Check if two layout items overlap
function itemsOverlap(a: LayoutItem, b: LayoutItem): boolean {
  return !(
    a.x + a.w <= b.x ||
    b.x + b.w <= a.x ||
    a.y + a.h <= b.y ||
    b.y + b.h <= a.y
  )
}

// Calculate displacement based on drag direction
function calculateDisplacement(
  draggedItem: LayoutItem,
  targetItem: LayoutItem,
  dragStartPos: { x: number; y: number }
): { x: number; y: number } {
  // Direction vector from dragged item's start to current position
  const dragDirX = draggedItem.x - dragStartPos.x
  const dragDirY = draggedItem.y - dragStartPos.y

  // Determine primary direction based on drag movement
  const absDirX = Math.abs(dragDirX)
  const absDirY = Math.abs(dragDirY)

  let newX = targetItem.x
  let newY = targetItem.y

  if (absDirX > absDirY) {
    // Horizontal drag - push left or right
    if (dragDirX > 0) {
      // Dragging right, push target right
      newX = draggedItem.x + draggedItem.w
    } else {
      // Dragging left, push target left
      newX = draggedItem.x - targetItem.w
    }
  } else {
    // Vertical drag - push up or down
    if (dragDirY > 0) {
      // Dragging down, push target down
      newY = draggedItem.y + draggedItem.h
    } else {
      // Dragging up, push target up
      newY = draggedItem.y - targetItem.h
    }
  }

  // Ensure non-negative positions
  return {
    x: Math.max(0, newX),
    y: Math.max(0, newY),
  }
}

interface DragState {
  draggedId: string
  dragStartPos: { x: number; y: number }
  originalPositions: Map<string, { x: number; y: number }>
  currentlyDisplacedId: string | null
  displacedToPos: { x: number; y: number } | null
}

// Compactor that prevents all collision handling - we'll do it ourselves
const freePositionCompactor = getCompactor(null, true, true)

export function WidgetGrid({
  widgets,
  layout,
  isEditing = false,
  onLayoutChange,
  onWidgetUpdate,
  onWidgetDelete,
}: WidgetGridProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { width, containerRef, mounted } = useContainerWidth() as any

  // Track drag state for live swap preview
  const dragState = useRef<DragState | null>(null)

  // Delay timer for displacement (prevents accidental swaps when passing over)
  const displacementTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingCollisionId = useRef<string | null>(null)

  // Preview layout during drag (shows displaced items in real-time)
  const [previewLayout, setPreviewLayout] = useState<LayoutItem[] | null>(null)

  // Delay in ms before displacement triggers (adjust as needed)
  const DISPLACEMENT_DELAY = 2000

  const baseLayout = useMemo(
    () =>
      widgets.map((widget) => ({
        i: widget.id,
        x: widget.position.x,
        y: widget.position.y,
        w: widget.position.width,
        h: widget.position.height,
        minW: 2,
        minH: 1,
      })),
    [widgets]
  )

  // Use preview layout during drag, otherwise use base layout
  const gridLayout = previewLayout || baseLayout

  // Handle drag start - store all original positions
  const handleDragStart = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_layout: any, oldItem: any) => {
      const originalPositions = new Map<string, { x: number; y: number }>()
      baseLayout.forEach((item) => {
        originalPositions.set(item.i, { x: item.x, y: item.y })
      })

      dragState.current = {
        draggedId: oldItem.i,
        dragStartPos: { x: oldItem.x, y: oldItem.y },
        originalPositions,
        currentlyDisplacedId: null,
        displacedToPos: null,
      }
    },
    [baseLayout]
  )

  // Track current dragged item for building preview
  const currentDraggedItem = useRef<LayoutItem | null>(null)

  // Handle drag - live preview of displacement with delay
  const handleDrag = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_currentLayout: any, _oldItem: any, newItem: any) => {
      if (!dragState.current) return

      const state = dragState.current

      // Build current dragged item
      const draggedItemBase = baseLayout.find((item) => item.i === state.draggedId)
      if (!draggedItemBase) return

      const draggedItem: LayoutItem = {
        ...draggedItemBase,
        x: newItem.x,
        y: newItem.y,
      }
      currentDraggedItem.current = draggedItem

      // Find collision with any other item at their original positions
      let collidingItem: LayoutItem | null = null
      for (const item of baseLayout) {
        if (item.i !== state.draggedId) {
          const origPos = state.originalPositions.get(item.i)!
          const itemAtOriginal: LayoutItem = { ...item, x: origPos.x, y: origPos.y }
          if (itemsOverlap(draggedItem, itemAtOriginal)) {
            collidingItem = itemAtOriginal
            break
          }
        }
      }

      const collidingId = collidingItem?.i || null

      // Check if collision target changed
      if (collidingId !== pendingCollisionId.current) {
        // Clear any existing timer
        if (displacementTimer.current) {
          clearTimeout(displacementTimer.current)
          displacementTimer.current = null
        }

        pendingCollisionId.current = collidingId

        if (collidingId === null) {
          // Moved away - immediately revert
          if (state.currentlyDisplacedId !== null) {
            state.currentlyDisplacedId = null
            state.displacedToPos = null
          }
        } else if (collidingId !== state.currentlyDisplacedId) {
          // Start delay timer for new collision
          const targetItem = collidingItem!
          displacementTimer.current = setTimeout(() => {
            if (dragState.current && pendingCollisionId.current === collidingId && currentDraggedItem.current) {
              // Calculate displacement based on drag direction
              const displacedPos = calculateDisplacement(
                currentDraggedItem.current,
                targetItem,
                dragState.current.dragStartPos
              )
              dragState.current.currentlyDisplacedId = collidingId
              dragState.current.displacedToPos = displacedPos
              // Force re-render
              setPreviewLayout([])
            }
            displacementTimer.current = null
          }, DISPLACEMENT_DELAY)
        }
      }

      // Build preview layout
      const preview = baseLayout.map((item) => {
        if (item.i === state.draggedId) {
          return { ...item, x: newItem.x, y: newItem.y }
        }
        if (state.currentlyDisplacedId && item.i === state.currentlyDisplacedId && state.displacedToPos) {
          return { ...item, ...state.displacedToPos }
        }
        return item
      })
      setPreviewLayout(preview)
    },
    [baseLayout, DISPLACEMENT_DELAY]
  )

  // Handle drag stop - commit the layout
  const handleDragStop = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_currentLayout: any, _oldItem: any, newItem: any) => {
      // Clear timer
      if (displacementTimer.current) {
        clearTimeout(displacementTimer.current)
        displacementTimer.current = null
      }
      pendingCollisionId.current = null
      currentDraggedItem.current = null

      if (!dragState.current) return

      const state = dragState.current

      // Build final layout
      const finalLayout = baseLayout.map((item) => {
        if (item.i === state.draggedId) {
          return { ...item, x: newItem.x, y: newItem.y }
        }
        if (state.currentlyDisplacedId && item.i === state.currentlyDisplacedId && state.displacedToPos) {
          return { ...item, ...state.displacedToPos }
        }
        return item
      })

      onLayoutChange?.(finalLayout)
      dragState.current = null
      setPreviewLayout(null)
    },
    [onLayoutChange, baseLayout]
  )

  // Ignore layout changes from grid during drag
  const handleLayoutChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (newLayout: any) => {
      if (!dragState.current) {
        onLayoutChange?.(newLayout as LayoutItem[])
      }
    },
    [onLayoutChange]
  )

  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'text':
        return (
          <TextWidget
            widget={widget}
            isEditing={isEditing}
            onContentChange={(content) =>
              onWidgetUpdate?.(widget.id, { content } as Partial<Widget>)
            }
          />
        )
      case 'image':
        return (
          <ImageWidget
            widget={widget}
            isEditing={isEditing}
            onUrlChange={(url) =>
              onWidgetUpdate?.(widget.id, { url } as Partial<Widget>)
            }
          />
        )
      case 'link-button':
        return (
          <LinkButtonWidget
            widget={widget}
            isEditing={isEditing}
            onLabelChange={(label) =>
              onWidgetUpdate?.(widget.id, { label } as Partial<Widget>)
            }
            onUrlChange={(url) =>
              onWidgetUpdate?.(widget.id, { url } as Partial<Widget>)
            }
          />
        )
      default:
        return null
    }
  }

  if (widgets.length === 0 && !isEditing) {
    return (
      <div className="flex h-32 items-center justify-center text-gray-400">
        No widgets yet
      </div>
    )
  }

  return (
    <div ref={containerRef} className="h-full w-full">
      {mounted && (
        <ReactGridLayout
          className="layout"
          layout={gridLayout}
          width={width}
          gridConfig={{ cols: layout.columns, rowHeight: layout.rowHeight, margin: [8, 8], containerPadding: [0, 0] }}
          dragConfig={{ enabled: isEditing, handle: '.widget-drag-handle' }}
          resizeConfig={{ enabled: isEditing }}
          onLayoutChange={handleLayoutChange}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragStop={handleDragStop}
          compactor={freePositionCompactor}
        >
          {widgets.map((widget) => (
            <div key={widget.id} className={isEditing ? 'widget-drag-handle cursor-move' : ''}>
              <WidgetWrapper
                widget={widget}
                isEditing={isEditing}
                onDelete={() => onWidgetDelete?.(widget.id)}
              >
                {renderWidget(widget)}
              </WidgetWrapper>
            </div>
          ))}
        </ReactGridLayout>
      )}
    </div>
  )
}
