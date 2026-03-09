import type { Tag } from '@/types'

interface TagSelectorProps {
  tags: Tag[]
  value: number | null
  onChange: (tagId: number | null) => void
  placeholder?: string
  required?: boolean
  className?: string
}

export function TagSelector({
  tags,
  value,
  onChange,
  placeholder = '태그 선택',
  required,
  className = '',
}: TagSelectorProps) {
  const selected = tags.find((t) => t.tagId === value)

  return (
    <div className={className}>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required={required}
      >
        <option value="">{placeholder}</option>
        {tags.map((t) => (
          <option key={t.tagId} value={t.tagId}>
            {t.tagName} ({t.type === 'weekly' ? '주간' : '월간'})
          </option>
        ))}
      </select>
      {selected && (
        <span
          className={
            selected.type === 'weekly'
              ? 'inline-block mt-1 bg-blue-100 text-blue-700 rounded-full px-2.5 py-0.5 text-xs font-medium'
              : 'inline-block mt-1 bg-purple-100 text-purple-700 rounded-full px-2.5 py-0.5 text-xs font-medium'
          }
        >
          {selected.tagName}
        </span>
      )}
    </div>
  )
}
