interface Project {
  name: string
  description: string
  tech: string[]
  url?: string
}

const projects: Project[] = [
  {
    name: 'ahpx-os',
    description: 'A web-based OS interface serving as my personal homepage',
    tech: ['React', 'TypeScript', 'Tailwind', 'Jotai'],
  },
  {
    name: 'Project Two',
    description: 'Description of your second project goes here',
    tech: ['Node.js', 'PostgreSQL'],
  },
  {
    name: 'Project Three',
    description: 'Description of your third project goes here',
    tech: ['Python', 'FastAPI'],
  },
]

export function ProjectsApp() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Projects</h1>

      <div className="space-y-4">
        {projects.map((project) => (
          <div
            key={project.name}
            className="border border-[var(--color-border)] bg-white p-4 transition-all hover:bg-[var(--color-primary-bg)]"
          >
            <h2 className="text-lg font-bold">{project.name}</h2>
            <p className="mt-1 text-gray-700">{project.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="border border-[var(--color-border)] bg-[var(--color-primary-bg)] px-2 py-0.5 text-xs font-medium"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
