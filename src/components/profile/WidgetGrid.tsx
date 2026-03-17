import { useMemo, useRef, useCallback } from 'react'
import ReactGridLayout, { useContainerWidth, getCompactor } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { useLocalAtom } from '@/hooks/useLocalAtom'
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

function itemsOverlap(a: LayoutItem, b: LayoutItem): boolean {
  return !(
    a.x + a.w <= b.x ||
    b.x + b.w <= a.x ||
    a.y + a.h <= b.y ||
    b.y + b.h <= a.y
  )
}

function calculateDisplacement(
  draggedItem: LayoutItem,
  targetItem: LayoutItem,
  dragStartPos: { x: number; y: number }
): { x: number; y: number } {
  const dragDirX = draggedItem.x - dragStartPos.x
  const dragDirY = draggedItem.y - dragStartPos.y
  const absDirX = Math.abs(dragDirX)
  const absDirY = Math.abs(dragDirY)

  let newX = targetItem.x
  let newY = targetItem.y

  if (absDirX > absDirY) {
    newX = dragDirX > 0 ? draggedItem.x + draggedItem.w : draggedItem.x - targetItem.w
  } else {
    newY = dragDirY > 0 ? draggedItem.y + draggedItem.h : draggedItem.y - targetItem.h
  }

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
  const dragState = useRef<DragState | null>(null)
  const displacementTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingCollisionId = useRef<string | null>(null)
  const currentDraggedItem = useRef<LayoutItem | null>(null)
  const [previewLayout, setPreviewLayout] = useLocalAtom<LayoutItem[] | null>(() => null, [])
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

  const gridLayout = previewLayout || baseLayout

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

  const handleDrag = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_currentLayout: any, _oldItem: any, newItem: any) => {
      if (!dragState.current) return

      const state = dragState.current
      const draggedItemBase = baseLayout.find((item) => item.i === state.draggedId)
      if (!draggedItemBase) return

      const draggedItem: LayoutItem = {
        ...draggedItemBase,
        x: newItem.x,
        y: newItem.y,
      }
      currentDraggedItem.current = draggedItem

      let collidingItem: LayoutItem | null = null
      for (const item of baseLayout) {
        if (item.i === state.draggedId) continue

        const originalPosition = state.originalPositions.get(item.i)
        if (!originalPosition) continue

        const itemAtOriginal: LayoutItem = {
          ...item,
          x: originalPosition.x,
          y: originalPosition.y,
        }

        if (itemsOverlap(draggedItem, itemAtOriginal)) {
          collidingItem = itemAtOriginal
          break
        }
      }

      const collidingId = collidingItem?.i || null

      if (collidingId !== pendingCollisionId.current) {
        if (displacementTimer.current) {
          clearTimeout(displacementTimer.current)
          displacementTimer.current = null
        }

        pendingCollisionId.current = collidingId

        if (collidingId === null) {
          if (state.currentlyDisplacedId !== null) {
            state.currentlyDisplacedId = null
            state.displacedToPos = null
          }
        } else if (collidingId !== state.currentlyDisplacedId) {
          const targetItem = collidingItem!
          displacementTimer.current = setTimeout(() => {
            if (
              dragState.current &&
              pendingCollisionId.current === collidingId &&
              currentDraggedItem.current
            ) {
              const displacedPos = calculateDisplacement(
                currentDraggedItem.current,
                targetItem,
                dragState.current.dragStartPos
              )
              dragState.current.currentlyDisplacedId = collidingId
              dragState.current.displacedToPos = displacedPos
              setPreviewLayout([])
            }
            displacementTimer.current = null
          }, DISPLACEMENT_DELAY)
        }
      }

      const nextPreview = baseLayout.map((item) => {
        if (item.i === state.draggedId) {
          return { ...item, x: newItem.x, y: newItem.y }
        }
        if (
          state.currentlyDisplacedId &&
          item.i === state.currentlyDisplacedId &&
          state.displacedToPos
        ) {
          return { ...item, ...state.displacedToPos }
        }
        return item
      })

      setPreviewLayout(nextPreview)
    },
    [DISPLACEMENT_DELAY, baseLayout, setPreviewLayout]
  )

  const handleDragStop = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_currentLayout: any, _oldItem: any, newItem: any) => {
      if (displacementTimer.current) {
        clearTimeout(displacementTimer.current)
        displacementTimer.current = null
      }
      pendingCollisionId.current = null
      currentDraggedItem.current = null

      if (!dragState.current) return

      const state = dragState.current
      const finalLayout = baseLayout.map((item) => {
        if (item.i === state.draggedId) {
          return { ...item, x: newItem.x, y: newItem.y }
        }
        if (
          state.currentlyDisplacedId &&
          item.i === state.currentlyDisplacedId &&
          state.displacedToPos
        ) {
          return { ...item, ...state.displacedToPos }
        }
        return item
      })

      onLayoutChange?.(finalLayout)
      dragState.current = null
      setPreviewLayout(null)
    },
    [baseLayout, onLayoutChange, setPreviewLayout]
  )

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
            onContentChange={(content) => onWidgetUpdate?.(widget.id, { content } as Partial<Widget>)}
          />
        )
      case 'image':
        return (
          <ImageWidget
            widget={widget}
            isEditing={isEditing}
            onUrlChange={(url) => onWidgetUpdate?.(widget.id, { url } as Partial<Widget>)}
          />
        )
      case 'link-button':
        return (
          <LinkButtonWidget
            widget={widget}
            isEditing={isEditing}
            onLabelChange={(label) => onWidgetUpdate?.(widget.id, { label } as Partial<Widget>)}
            onUrlChange={(url) => onWidgetUpdate?.(widget.id, { url } as Partial<Widget>)}
          />
        )
      default:
        return null
    }
  }

  if (widgets.length === 0 && !isEditing) {
    return <div className="flex h-32 items-center justify-center text-gray-400">No widgets yet</div>
  }

  return (
    <div ref={containerRef} className="h-full w-full p-4">
      {mounted && (
        <ReactGridLayout
          className="layout"
          layout={gridLayout}
          width={width}
          gridConfig={{
            cols: layout.columns,
            rowHeight: layout.rowHeight,
            margin: [8, 8],
            containerPadding: [0, 0],
          }}
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
