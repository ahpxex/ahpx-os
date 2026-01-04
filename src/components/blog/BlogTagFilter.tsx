interface BlogTagFilterProps {
  tags: string[]
  selectedTag: string | null
  onSelectTag: (tag: string | null) => void
}

export function BlogTagFilter({ tags, selectedTag, onSelectTag }: BlogTagFilterProps) {
  return (
    <div className="flex flex-wrap gap-1">
      <button
        onClick={() => onSelectTag(null)}
        className={`px-2 py-0.5 text-xs transition-colors ${
          selectedTag === null
            ? 'bg-[var(--color-primary)] text-white'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
          className={`px-2 py-0.5 text-xs transition-colors ${
            selectedTag === tag
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-[var(--color-primary-bg)] text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] hover:text-white'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
