import { useSetAtom } from 'jotai'
import { updateProfileAtom } from '@/store/profileActions'
import { useLocalAtom } from '@/hooks/useLocalAtom'
import { WidgetGrid } from './WidgetGrid'
import type { Profile } from '@/types/database'
import type { ProfileContent, Widget, WidgetType, ProfileLayout } from '@/types/profile'
import { DEFAULT_LAYOUT, DEFAULT_WIDGET_SIZES } from '@/types/profile'

interface LayoutItem {
  i: string
  x: number
  y: number
  w: number
  h: number
}

interface ProfileEditorProps {
  profile: Profile
  onSave: () => void
  onCancel: () => void
}

interface ProfileEditorState {
  saving: boolean
  widgets: Widget[]
  layout: ProfileLayout
}

export function ProfileEditor({ profile, onSave, onCancel }: ProfileEditorProps) {
  const updateProfile = useSetAtom(updateProfileAtom)
  const initialContent = profile.content as ProfileContent | null
  const [editorState, setEditorState] = useLocalAtom<ProfileEditorState>(
    () => ({
      saving: false,
      widgets: initialContent?.widgets || [],
      layout: initialContent?.layout || DEFAULT_LAYOUT,
    }),
    [profile.id]
  )
  const { saving, widgets, layout } = editorState

  const handleLayoutChange = (newLayout: LayoutItem[]) => {
    setEditorState((prev) => ({
      ...prev,
      widgets: prev.widgets.map((widget) => {
        const layoutItem = newLayout.find((entry) => entry.i === widget.id)
        if (!layoutItem) return widget

        return {
          ...widget,
          position: {
            x: layoutItem.x,
            y: layoutItem.y,
            width: layoutItem.w,
            height: layoutItem.h,
          },
        }
      }),
    }))
  }

  const handleWidgetUpdate = (widgetId: string, updates: Partial<Widget>) => {
    setEditorState((prev) => ({
      ...prev,
      widgets: prev.widgets.map((widget) =>
        widget.id === widgetId ? ({ ...widget, ...updates } as Widget) : widget
      ),
    }))
  }

  const handleWidgetDelete = (widgetId: string) => {
    setEditorState((prev) => ({
      ...prev,
      widgets: prev.widgets.filter((widget) => widget.id !== widgetId),
    }))
  }

  const addWidget = (type: WidgetType) => {
    const size = DEFAULT_WIDGET_SIZES[type]
    const maxY = widgets.reduce(
      (max, widget) => Math.max(max, widget.position.y + widget.position.height),
      0
    )

    let newWidget: Widget

    if (type === 'text') {
      newWidget = {
        id: crypto.randomUUID(),
        type: 'text',
        position: { x: 0, y: maxY, ...size },
        content: '',
      }
    } else if (type === 'image') {
      newWidget = {
        id: crypto.randomUUID(),
        type: 'image',
        position: { x: 0, y: maxY, ...size },
        url: '',
        alt: '',
      }
    } else {
      newWidget = {
        id: crypto.randomUUID(),
        type: 'link-button',
        position: { x: 0, y: maxY, ...size },
        label: 'Link',
        url: '',
        variant: 'primary',
      }
    }

    setEditorState((prev) => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
    }))
  }

  const handleSave = async () => {
    setEditorState((prev) => ({ ...prev, saving: true }))

    try {
      const newContent: ProfileContent = {
        widgets,
        layout,
      }

      await updateProfile({
        id: profile.id,
        updates: { content: newContent },
      })

      onSave()
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setEditorState((prev) => ({ ...prev, saving: false }))
    }
  }

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex-1 overflow-auto pb-16">
        <WidgetGrid
          widgets={widgets}
          layout={layout}
          isEditing={true}
          onLayoutChange={handleLayoutChange}
          onWidgetUpdate={handleWidgetUpdate}
          onWidgetDelete={handleWidgetDelete}
        />
      </div>

      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 border border-[var(--color-border)] bg-white px-4 py-2 shadow-md">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addWidget('text')}
            className="border border-[var(--color-border)] bg-white px-2 py-1 text-xs hover:bg-[var(--color-primary-bg)]"
          >
            + Text
          </button>
          <button
            type="button"
            onClick={() => addWidget('image')}
            className="border border-[var(--color-border)] bg-white px-2 py-1 text-xs hover:bg-[var(--color-primary-bg)]"
          >
            + Image
          </button>
          <button
            type="button"
            onClick={() => addWidget('link-button')}
            className="border border-[var(--color-border)] bg-white px-2 py-1 text-xs hover:bg-[var(--color-primary-bg)]"
          >
            + Link
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="border border-[var(--color-border)] bg-white px-3 py-1 text-sm hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="border border-[var(--color-primary)] bg-[var(--color-primary)] px-3 py-1 text-sm text-white hover:bg-[var(--color-primary-dark)]"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
