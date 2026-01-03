export function ShawnFanApp() {
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full border border-[var(--color-border)] bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl">
          🎸
        </div>
        <div>
          <h1 className="text-2xl font-bold">Shawn Fan</h1>
          <p className="text-gray-600">Music & Creative</p>
        </div>
      </div>

      <div className="space-y-4">
        <section>
          <h2 className="mb-2 text-lg font-bold">About</h2>
          <p className="text-gray-700">
            Musician, creative thinker, and digital explorer.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold">Interests</h2>
          <div className="flex flex-wrap gap-2">
            {['Music', 'Art', 'Design', 'Photography', 'Film'].map((interest) => (
              <span
                key={interest}
                className="border border-[var(--color-border)] bg-[var(--color-primary-bg)] px-3 py-1 text-sm font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
