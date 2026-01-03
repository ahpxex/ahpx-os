import { useState } from 'react'
import { useSetAtom } from 'jotai'
import { v4 as uuidv4 } from 'uuid'
import { updateProfileAtom } from '@/store/profileActions'
import { GadgetGrid } from './GadgetGrid'
import type { Profile } from '@/types/database'
import type { ProfileContent, Gadget, GadgetType, ProfileLayout } from '@/types/profile'
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
  const [gadgets, setGadgets] = useState<Gadget[]>(initialContent?.gadgets || [])
  const [layout] = useState<ProfileLayout>(initialContent?.layout || DEFAULT_LAYOUT)

  const handleLayoutChange = (newLayout: LayoutItem[]) => {
    setGadgets((prev) =>
      prev.map((gadget) => {
        const layoutItem = newLayout.find((l) => l.i === gadget.id)
        if (layoutItem) {
          return {
            ...gadget,
            position: {
              x: layoutItem.x,
              y: layoutItem.y,
              width: layoutItem.w,
              height: layoutItem.h,
            },
          }
        }
        return gadget
      })
    )
  }

  const handleGadgetUpdate = (gadgetId: string, updates: Partial<Gadget>) => {
    setGadgets((prev) =>
      prev.map((g) => {
        if (g.id !== gadgetId) return g
        // Merge updates while preserving the gadget type
        return { ...g, ...updates } as Gadget
      })
    )
  }

  const handleGadgetDelete = (gadgetId: string) => {
    setGadgets((prev) => prev.filter((g) => g.id !== gadgetId))
  }

  const addGadget = (type: GadgetType) => {
    const defaultSizes: Record<GadgetType, { width: number; height: number }> = {
      text: { width: 12, height: 4 },
      image: { width: 6, height: 6 },
      'link-button': { width: 4, height: 2 },
    }

    const size = defaultSizes[type]

    // Find next available y position
    const maxY = gadgets.reduce((max, g) => Math.max(max, g.position.y + g.position.height), 0)

    let newGadget: Gadget

    if (type === 'text') {
      newGadget = {
        id: uuidv4(),
        type: 'text',
        position: { x: 0, y: maxY, ...size },
        content: '',
      }
    } else if (type === 'image') {
      newGadget = {
        id: uuidv4(),
        type: 'image',
        position: { x: 0, y: maxY, ...size },
        url: '',
        alt: '',
      }
    } else {
      newGadget = {
        id: uuidv4(),
        type: 'link-button',
        position: { x: 0, y: maxY, ...size },
        label: 'Link',
        url: '',
        variant: 'primary',
      }
    }

    setGadgets((prev) => [...prev, newGadget])
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const newContent: ProfileContent = {
        gadgets,
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
      <GadgetGrid
        gadgets={gadgets}
        layout={layout}
        isEditing={true}
        onLayoutChange={handleLayoutChange}
        onGadgetUpdate={handleGadgetUpdate}
        onGadgetDelete={handleGadgetDelete}
      />

      {/* Floating Bottom Toolbar */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 border border-[var(--color-border)] bg-white px-4 py-2 shadow-md">
        {/* Add Gadget Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addGadget('text')}
            className="border border-[var(--color-border)] bg-white px-2 py-1 text-xs hover:bg-[var(--color-primary-bg)]"
          >
            + Text
          </button>
          <button
            type="button"
            onClick={() => addGadget('image')}
            className="border border-[var(--color-border)] bg-white px-2 py-1 text-xs hover:bg-[var(--color-primary-bg)]"
          >
            + Image
          </button>
          <button
            type="button"
            onClick={() => addGadget('link-button')}
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
