import { useRef, useState, useEffect } from 'react'
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
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(600)

  // Get content with type safety
  const content = profile.content as ProfileContent | null
  const gadgets = content?.gadgets || []
  const layout = content?.layout || DEFAULT_LAYOUT

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth - 32) // minus padding
      }
    }

    updateWidth()

    const resizeObserver = new ResizeObserver(updateWidth)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="h-full overflow-auto">
      <div className="p-4">
        {/* Profile Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="h-16 w-16 rounded-full border border-[var(--color-border)] object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-primary)] text-2xl font-bold text-white">
                {profile.name[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold">{profile.name}</h1>
              {profile.date && (
                <p className="text-sm text-gray-500">Since {profile.date}</p>
              )}
            </div>
          </div>

          {isAuthenticated && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="border border-[var(--color-border)] bg-white px-3 py-1 text-sm font-medium hover:bg-[var(--color-primary-bg)]"
            >
              Edit
            </button>
          )}
        </div>

        {/* Gadgets Grid */}
        {gadgets.length > 0 ? (
          <GadgetGrid
            gadgets={gadgets}
            layout={layout}
            width={containerWidth}
            isEditing={false}
          />
        ) : (
          // Fallback to legacy content if no gadgets
          <LegacyContent content={content} />
        )}
      </div>
    </div>
  )
}

// Render legacy content format (about, skills, contact)
function LegacyContent({ content }: { content: ProfileContent | null }) {
  if (!content) {
    return (
      <div className="text-center text-gray-400">
        No content yet. Click Edit to add gadgets.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {content.about && (
        <section>
          <h2 className="mb-2 text-lg font-bold">About</h2>
          <p className="text-gray-700">{content.about}</p>
        </section>
      )}

      {content.skills && content.skills.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-bold">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {content.skills.map((skill) => (
              <span
                key={skill}
                className="border border-[var(--color-border)] bg-[var(--color-primary-bg)] px-3 py-1 text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {content.contact && (
        <section>
          <h2 className="mb-2 text-lg font-bold">Contact</h2>
          <div className="space-y-1 text-gray-700">
            {content.contact.github && <p>GitHub: {content.contact.github}</p>}
            {content.contact.email && <p>Email: {content.contact.email}</p>}
            {content.contact.twitter && <p>Twitter: {content.contact.twitter}</p>}
            {content.contact.linkedin && <p>LinkedIn: {content.contact.linkedin}</p>}
          </div>
        </section>
      )}
    </div>
  )
}
