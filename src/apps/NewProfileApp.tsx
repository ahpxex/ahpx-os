import { useState } from 'react'
import { useSetAtom } from 'jotai'
import { createProfileAtom } from '@/store/profileActions'
import { useOS } from '@/hooks/useOS'

export function NewProfileApp() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [icon, setIcon] = useState('/apps/cs-user.png')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createProfile = useSetAtom(createProfileAtom)
  const { closeWindow } = useOS()

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value)
    // Only auto-generate slug if user hasn't manually edited it
    if (!slug || slug === name.toLowerCase().replace(/\s+/g, '-')) {
      setSlug(value.toLowerCase().replace(/\s+/g, '-'))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    if (!slug.trim()) {
      setError('Slug is required')
      return
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError('Slug can only contain lowercase letters, numbers, and hyphens')
      return
    }

    setSaving(true)

    try {
      await createProfile({
        name: name.trim(),
        slug: slug.trim(),
        icon,
      })

      // Close the window after successful creation
      closeWindow('new-profile')
    } catch (err) {
      console.error('Failed to create profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to create profile')
    } finally {
      setSaving(false)
    }
  }

  // Common icon options
  const iconOptions = [
    { value: '/apps/cs-user.png', label: 'User' },
    { value: '/apps/web-browser.png', label: 'Internet' },
    { value: '/apps/terminal.png', label: 'Terminal' },
    { value: '/apps/accessories-text-editor.png', label: 'Text Editor' },
    { value: '/apps/accessories-calculator.png', label: 'Calculator' },
    { value: '/apps/accessories-character-map.png', label: 'Character Map' },
    { value: '/places/folder.png', label: 'Folder' },
    { value: '/places/folder-documents.png', label: 'Documents' },
    { value: '/places/folder-download.png', label: 'Downloads' },
    { value: '/places/folder-pictures.png', label: 'Pictures' },
  ]

  return (
    <div className="p-4">
      <h2 className="mb-4 text-lg font-bold">Create New Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g., John Doe"
            className="w-full border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>

        <div>
          <label htmlFor="slug" className="mb-1 block text-sm font-medium">
            Slug (URL-friendly identifier)
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            placeholder="e.g., john-doe"
            className="w-full border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
          <p className="mt-1 text-xs text-gray-500">
            This will appear as "{slug || 'slug'}.exe" on the desktop
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Icon</label>
          <div className="flex flex-wrap gap-2">
            {iconOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setIcon(option.value)}
                className={`flex h-10 w-10 min-h-0 min-w-0 items-center justify-center border p-0 shadow-none ${
                  icon === option.value
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)]'
                    : 'border-[var(--color-border)] hover:bg-gray-50'
                }`}
                title={option.label}
              >
                <img src={option.value} alt={option.label} className="h-6 w-6" />
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded border border-red-300 bg-red-50 p-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => closeWindow('new-profile')}
            disabled={saving}
            className="border border-[var(--color-border)] bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="border border-[var(--color-primary)] bg-[var(--color-primary)] px-4 py-2 text-sm text-white hover:bg-[var(--color-primary-dark)]"
          >
            {saving ? 'Creating...' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}
