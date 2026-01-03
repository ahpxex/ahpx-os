import type { Profile } from '@/types/database'
import type { ProfileContent } from '@/types/profile'
import { WidgetGrid } from './WidgetGrid'
import { DEFAULT_LAYOUT } from '@/types/profile'

interface ProfileViewProps {
  profile: Profile
  onContextMenu?: (e: React.MouseEvent) => void
}

export function ProfileView({ profile, onContextMenu }: ProfileViewProps) {
  // Get content with type safety
  const content = profile.content as ProfileContent | null
  const widgets = content?.widgets || []
  const layout = content?.layout || DEFAULT_LAYOUT

  return (
    <div className="h-full overflow-auto" onContextMenu={onContextMenu}>
      {widgets.length > 0 ? (
        <WidgetGrid
          widgets={widgets}
          layout={layout}
          isEditing={false}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-gray-400">
          No content yet.
        </div>
      )}
    </div>
  )
}
