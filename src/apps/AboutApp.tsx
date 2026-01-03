export function AboutApp() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full border border-[var(--color-border)] bg-[var(--color-primary)]" />
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
