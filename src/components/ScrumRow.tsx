import type { Tag } from '@/types'
import { TagSelector } from './TagSelector'

export interface ScrumRowData {
  taskId: number
  taskTitle: string
  taskLink: string
  done: string
  workHours: number
  performance: string
  tagId: number | null
  monthlyTagName?: string | null
}

interface ScrumRowProps {
  row: ScrumRowData
  weeklyTags: Tag[]
  onChange: (row: ScrumRowData) => void
  onRemove: () => void
  getMonthlyTagName: (weeklyTagId: number) => string | null
}

export function ScrumRow({
  row,
  weeklyTags,
  onChange,
  onRemove,
  getMonthlyTagName,
}: ScrumRowProps) {
  const monthlyName = row.tagId ? getMonthlyTagName(row.tagId) : null

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3 relative">
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-lg leading-none"
        aria-label="행 제거"
      >
        ×
      </button>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">업무 제목</label>
          <input
            type="text"
            value={row.taskTitle}
            onChange={(e) => onChange({ ...row, taskTitle: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="업무 제목"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">업무 링크</label>
          <a
            href={row.taskLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-sm text-blue-600 hover:underline"
          >
            {row.taskLink || '—'}
          </a>
        </div>
      </div>
      <div className="mt-3">
        <label className="block text-xs text-gray-500 mb-1">
          해당 업무로 한 일 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={row.done}
          onChange={(e) => onChange({ ...row, done: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={2}
          required
          placeholder="한 일 (필수)"
        />
      </div>
      <div className="mt-3 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">투입시간</label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={row.workHours || ''}
            onChange={(e) =>
              onChange({ ...row, workHours: Number(e.target.value) || 0 })
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            주간 보고 태그 <span className="text-red-500">*</span>
          </label>
          <TagSelector
            tags={weeklyTags}
            value={row.tagId}
            onChange={(tagId) => onChange({ ...row, tagId })}
            placeholder="선택"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">월간 보고 태그</label>
          <div className="py-2 text-sm text-gray-500">
            {monthlyName ?? '주간 태그 선택 시 자동 매핑'}
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">어필할 성과</label>
          <input
            type="text"
            value={row.performance}
            onChange={(e) => onChange({ ...row, performance: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="선택"
          />
        </div>
      </div>
    </div>
  )
}
