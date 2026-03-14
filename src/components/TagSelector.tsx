import type { Tag } from '@/types'

interface TagSelectorProps {
  tags: Tag[]
  value: number | null
  onChange: (tagId: number | null) => void
  placeholder?: string
  required?: boolean
  className?: string
  disabled?: boolean
  error?: boolean
}

export function TagSelector({
  tags,
  value,
  onChange,
  placeholder = '태그 선택',
  required,
  className = '',
  disabled = false,
  error = false,
}: TagSelectorProps) {
  return (
    <div className={className}>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
        required={required}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {tags.map((t) => (
          <option key={t.tagId} value={t.tagId}>
            {t.tagName}
          </option>
        ))}
      </select>
    </div>
  )
}
