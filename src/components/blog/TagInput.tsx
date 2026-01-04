import { useState } from 'react'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ tags, onChange, placeholder = 'Add tag...' }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const newTag = inputValue.trim().toLowerCase()
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag])
      }
      setInputValue('')
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag on backspace when input is empty
      onChange(tags.slice(0, -1))
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border border-[var(--color-border)] bg-white p-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded bg-[var(--color-primary-bg)] px-2 py-0.5 text-sm text-[var(--color-primary)]"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="ml-0.5 hover:text-[var(--color-primary-dark)]"
          >
            x
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="min-w-[100px] flex-1 border-0 bg-transparent px-1 py-0.5 text-sm outline-none"
      />
    </div>
  )
}
