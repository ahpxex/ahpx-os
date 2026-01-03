import { useMemo } from 'react'
import ReactGridLayout, { useContainerWidth, noCompactor } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import type { Gadget, ProfileLayout } from '@/types/profile'
import { TextGadget, ImageGadget, LinkButtonGadget, GadgetWrapper } from './gadgets'

interface LayoutItem {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
}

interface GadgetGridProps {
  gadgets: Gadget[]
  layout: ProfileLayout
  isEditing?: boolean
  onLayoutChange?: (layout: LayoutItem[]) => void
  onGadgetUpdate?: (gadgetId: string, updates: Partial<Gadget>) => void
  onGadgetDelete?: (gadgetId: string) => void
}

export function GadgetGrid({
  gadgets,
  layout,
  isEditing = false,
  onLayoutChange,
  onGadgetUpdate,
  onGadgetDelete,
}: GadgetGridProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { width, containerRef, mounted } = useContainerWidth() as any

  const gridLayout = useMemo(
    () =>
      gadgets.map((gadget) => ({
        i: gadget.id,
        x: gadget.position.x,
        y: gadget.position.y,
        w: gadget.position.width,
        h: gadget.position.height,
        minW: 2,
        minH: 1,
      })),
    [gadgets]
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLayoutChange = (newLayout: any) => {
    onLayoutChange?.(newLayout as LayoutItem[])
  }

  const renderGadget = (gadget: Gadget) => {
    switch (gadget.type) {
      case 'text':
        return (
          <TextGadget
            gadget={gadget}
            isEditing={isEditing}
            onContentChange={(content) =>
              onGadgetUpdate?.(gadget.id, { content } as Partial<Gadget>)
            }
          />
        )
      case 'image':
        return (
          <ImageGadget
            gadget={gadget}
            isEditing={isEditing}
            onUrlChange={(url) =>
              onGadgetUpdate?.(gadget.id, { url } as Partial<Gadget>)
            }
          />
        )
      case 'link-button':
        return (
          <LinkButtonGadget
            gadget={gadget}
            isEditing={isEditing}
            onLabelChange={(label) =>
              onGadgetUpdate?.(gadget.id, { label } as Partial<Gadget>)
            }
            onUrlChange={(url) =>
              onGadgetUpdate?.(gadget.id, { url } as Partial<Gadget>)
            }
          />
        )
      default:
        return null
    }
  }

  if (gadgets.length === 0 && !isEditing) {
    return (
      <div className="flex h-32 items-center justify-center text-gray-400">
        No gadgets yet
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
          dragConfig={{ enabled: isEditing, handle: '.gadget-drag-handle' }}
          resizeConfig={{ enabled: isEditing }}
          onLayoutChange={handleLayoutChange}
          compactor={noCompactor}
        >
          {gadgets.map((gadget) => (
            <div key={gadget.id} className={isEditing ? 'gadget-drag-handle cursor-move' : ''}>
              <GadgetWrapper
                gadget={gadget}
                isEditing={isEditing}
                onDelete={() => onGadgetDelete?.(gadget.id)}
              >
                {renderGadget(gadget)}
              </GadgetWrapper>
            </div>
          ))}
        </ReactGridLayout>
      )}
    </div>
  )
}
