import { useState } from 'react'
import { useSetAtom } from 'jotai'
import { v4 as uuidv4 } from 'uuid'
import { updateProfileAtom } from '@/store/profileActions'
import { WidgetGrid } from './WidgetGrid'
import type { Profile } from '@/types/database'
import type { ProfileContent, Widget, WidgetType, ProfileLayout } from '@/types/profile'
import { DEFAULT_LAYOUT } from '@/types/profile'

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

export function ProfileEditor({ profile, onSave, onCancel }: ProfileEditorProps) {
  const [saving, setSaving] = useState(false)

  const updateProfile = useSetAtom(updateProfileAtom)

  // Initialize draft content from profile
  const initialContent = profile.content as ProfileContent | null
  const [widgets, setWidgets] = useState<Widget[]>(initialContent?.widgets || [])
  const [layout] = useState<ProfileLayout>(initialContent?.layout || DEFAULT_LAYOUT)

  const handleLayoutChange = (newLayout: LayoutItem[]) => {
    setWidgets((prev) =>
      prev.map((widget) => {
        const layoutItem = newLayout.find((l) => l.i === widget.id)
        if (layoutItem) {
          return {
            ...widget,
            position: {
              x: layoutItem.x,
              y: layoutItem.y,
              width: layoutItem.w,
              height: layoutItem.h,
            },
          }
        }
        return widget
      })
    )
  }

  const handleWidgetUpdate = (widgetId: string, updates: Partial<Widget>) => {
    setWidgets((prev) =>
      prev.map((w) => {
        if (w.id !== widgetId) return w
        // Merge updates while preserving the widget type
        return { ...w, ...updates } as Widget
      })
    )
  }

  const handleWidgetDelete = (widgetId: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== widgetId))
  }

  const addWidget = (type: WidgetType) => {
    const defaultSizes: Record<WidgetType, { width: number; height: number }> = {
      text: { width: 12, height: 4 },
      image: { width: 6, height: 6 },
      'link-button': { width: 4, height: 2 },
    }

    const size = defaultSizes[type]

    // Find next available y position
    const maxY = widgets.reduce((max, w) => Math.max(max, w.position.y + w.position.height), 0)

    let newWidget: Widget

    if (type === 'text') {
      newWidget = {
        id: uuidv4(),
        type: 'text',
        position: { x: 0, y: maxY, ...size },
        content: '',
      }
    } else if (type === 'image') {
      newWidget = {
        id: uuidv4(),
        type: 'image',
        position: { x: 0, y: maxY, ...size },
        url: '',
        alt: '',
      }
    } else {
      newWidget = {
        id: uuidv4(),
        type: 'link-button',
        position: { x: 0, y: maxY, ...size },
        label: 'Link',
        url: '',
        variant: 'primary',
      }
    }

    setWidgets((prev) => [...prev, newWidget])
  }

  const handleSave = async () => {
    setSaving(true)
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
      setSaving(false)
    }
  }

  return (
    <div className="relative h-full overflow-auto">
      {/* Editor Content - Full Area */}
      <WidgetGrid
        widgets={widgets}
        layout={layout}
        isEditing={true}
        onLayoutChange={handleLayoutChange}
        onWidgetUpdate={handleWidgetUpdate}
        onWidgetDelete={handleWidgetDelete}
      />

      {/* Floating Bottom Toolbar */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 border border-[var(--color-border)] bg-white px-4 py-2 shadow-md">
        {/* Add Widget Buttons */}
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

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300" />

        {/* Save/Cancel Buttons */}
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
