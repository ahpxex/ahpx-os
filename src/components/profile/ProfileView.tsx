import type { Profile } from '@/types/database'
import type { ProfileContent } from '@/types/profile'
import { GadgetGrid } from './GadgetGrid'
import { DEFAULT_LAYOUT } from '@/types/profile'

interface ProfileViewProps {
  profile: Profile
  isAuthenticated?: boolean
  onEdit?: () => void
}

export function ProfileView({ profile, isAuthenticated, onEdit }: ProfileViewProps) {
  // Get content with type safety
  const content = profile.content as ProfileContent | null
  const gadgets = content?.gadgets || []
  const layout = content?.layout || DEFAULT_LAYOUT

  return (
    <div className="relative h-full overflow-auto">
      {/* Edit Button */}
      {isAuthenticated && onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="absolute right-4 top-4 z-10 border border-[var(--color-border)] bg-white px-3 py-1 text-sm font-medium hover:bg-[var(--color-primary-bg)]"
        >
          Edit
        </button>
      )}

      {/* Gadgets Grid */}
      {gadgets.length > 0 ? (
        <GadgetGrid
          gadgets={gadgets}
          layout={layout}
          isEditing={false}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-gray-400">
          {isAuthenticated ? 'Click Edit to add gadgets.' : 'No content yet.'}
        </div>
      )}
    </div>
  )
}
