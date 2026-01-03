import { useMemo } from 'react'
import ReactGridLayout, { useContainerWidth, noCompactor } from 'react-grid-layout'
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

  const gridLayout = useMemo(
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLayoutChange = (newLayout: any) => {
    onLayoutChange?.(newLayout as LayoutItem[])
  }

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
          compactor={noCompactor}
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
