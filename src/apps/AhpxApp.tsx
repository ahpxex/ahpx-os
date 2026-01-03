import { useProfiles } from '@/hooks/useProfiles'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export function AhpxApp() {
  const { profiles } = useProfiles()

  if (profiles.length === 0) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-primary)] text-3xl font-bold text-white">
            A
          </div>
          <div>
            <h1 className="text-2xl font-bold">ahpx</h1>
            <p className="text-gray-600">Software Developer</p>
          </div>
        </div>

        <div className="space-y-4">
          <section>
            <h2 className="mb-2 text-lg font-bold">About</h2>
            <p className="text-gray-700">
              Welcome to my digital workspace. I build things for the web and
              enjoy exploring new technologies.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {['TypeScript', 'React', 'Node.js', 'Python', 'Go'].map((skill) => (
                <span
                  key={skill}
                  className="border border-[var(--color-border)] bg-[var(--color-primary-bg)] px-3 py-1 text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold">Contact</h2>
            <div className="space-y-1 text-gray-700">
              <p>GitHub: github.com/ahpx</p>
              <p>Email: hello@ahpx.dev</p>
            </div>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      {profiles.map((profile) => {
        const content = profile.content as any

        return (
          <div key={profile.id} className="border-b border-gray-200 pb-6 last:border-0">
            <div className="flex items-center gap-4">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="h-20 w-20 rounded-full border border-[var(--color-border)]"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-primary)] text-3xl font-bold text-white">
                  {profile.name[0].toUpperCase()}
                </div>
              )}

              <div>
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                {profile.date && (
                  <p className="text-sm text-gray-500">Since {profile.date}</p>
                )}
              </div>
            </div>

            {content?.about && (
              <section className="mt-4">
                <h2 className="mb-2 text-lg font-bold">About</h2>
                <p className="text-gray-700">{content.about}</p>
              </section>
            )}

            {content?.skills?.length > 0 && (
              <section className="mt-4">
                <h2 className="mb-2 text-lg font-bold">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {content.skills.map((skill: string) => (
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

            {content?.contact && (
              <section className="mt-4">
                <h2 className="mb-2 text-lg font-bold">Contact</h2>
                <div className="space-y-1 text-gray-700">
                  {content.contact.github && (
                    <p>GitHub: {content.contact.github}</p>
                  )}
                  {content.contact.email && (
                    <p>Email: {content.contact.email}</p>
                  )}
                  {content.contact.twitter && (
                    <p>Twitter: {content.contact.twitter}</p>
                  )}
                  {content.contact.linkedin && (
                    <p>LinkedIn: {content.contact.linkedin}</p>
                  )}
                </div>
              </section>
            )}
          </div>
        )
      })}
    </div>
  )
}
