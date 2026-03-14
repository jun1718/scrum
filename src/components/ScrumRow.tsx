import { useState } from 'react'
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
  readOnly?: boolean
}

export function ScrumRow({
  row,
  weeklyTags,
  onChange,
  onRemove,
  getMonthlyTagName,
  readOnly = false,
}: ScrumRowProps) {
  const monthlyName = row.tagId ? getMonthlyTagName(row.tagId) : null
  const [performanceModalOpen, setPerformanceModalOpen] = useState(false)
  const [performanceDraft, setPerformanceDraft] = useState('')

  const openPerformanceModal = () => {
    setPerformanceDraft(row.performance)
    setPerformanceModalOpen(true)
  }
  const closePerformanceModal = () => setPerformanceModalOpen(false)
  const savePerformance = () => {
    onChange({ ...row, performance: performanceDraft })
    closePerformanceModal()
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3 relative">
      {!readOnly && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-lg leading-none"
          aria-label="행 제거"
        >
          ×
        </button>
      )}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">업무 제목</label>
          <input
            type="text"
            value={row.taskTitle}
            onChange={(e) => onChange({ ...row, taskTitle: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="업무 제목"
            disabled={readOnly}
          />
          <p className="text-xs text-gray-400 mt-1">[프로토타입] 실서비스에서는 업무 링크 입력 시 Dooray API를 호출하여 업무 제목이 자동으로 채워집니다. API 응답이 없으면 빈 값입니다. 사용자가 직접 수정할 수 있습니다.</p>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">업무 링크</label>
          <div className="flex gap-2 items-center">
            <input
              type="url"
              value={row.taskLink}
              onChange={(e) => onChange({ ...row, taskLink: e.target.value })}
              onBlur={(e) => {
                const v = e.target.value.trim()
                if (!v) return
                const match = v.match(/\/tasks\/(\d+)$/)
                if (!match || !/^https:\/\/nhnent\.dooray\.com\/project\/tasks\/\d+$/.test(v)) {
                  alert('업무 링크는 https://nhnent.dooray.com/project/tasks/{taskId} 형식만 가능합니다.')
                  onChange({ ...row, taskLink: '', taskId: 0 })
                } else {
                  onChange({ ...row, taskLink: v, taskId: Number(match[1]) })
                }
              }}
              className="flex-1 min-w-0 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="https://nhnent.dooray.com/project/tasks/123456"
              disabled={readOnly}
            />
            {row.taskLink && /^https:\/\/nhnent\.dooray\.com\/project\/tasks\/\d+$/.test(row.taskLink) ? (
              <a
                href={row.taskLink}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-sm text-blue-600 hover:underline whitespace-nowrap"
              >
                새 탭에서 열기
              </a>
            ) : null}
          </div>
          <p className="text-xs text-gray-400 mt-1">두레이 업무의 "링크 복사" 버튼을 통해 복사한 것을 붙여넣기 해주세요.</p>
        </div>
      </div>
      <div className="mt-3">
        <label className="block text-xs text-gray-500 mb-1">
          해당 업무로 한 일 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={row.done}
          onChange={(e) => onChange({ ...row, done: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          rows={2}
          required
          placeholder="한 일 (필수)"
          disabled={readOnly}
        />
      </div>
      <div className="mt-3 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">투입시간 (1~24시간, 정수)</label>
          <input
            type="number"
            min={1}
            max={24}
            step={1}
            value={row.workHours || ''}
            onChange={(e) => {
              if (e.target.value === '') {
                onChange({ ...row, workHours: 0 })
                return
              }
              const v = Math.min(24, Math.max(1, Math.floor(Number(e.target.value) || 0)))
              onChange({ ...row, workHours: v })
            }}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="1~24"
            disabled={readOnly}
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
            disabled={readOnly}
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
          <button
            type="button"
            onClick={openPerformanceModal}
            disabled={readOnly}
            className="w-full text-left border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-50 min-h-[38px] disabled:bg-gray-100 disabled:text-gray-500"
          >
            <span className={row.performance ? 'text-gray-900' : 'text-gray-400'}>
              {row.performance || '클릭하여 입력'}
            </span>
          </button>
        </div>
      </div>

      {performanceModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50" role="dialog" aria-labelledby="performance-modal-title">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 id="performance-modal-title" className="font-semibold text-lg">어필할 성과</h2>
              <button
                type="button"
                onClick={closePerformanceModal}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4">
              <textarea
                value={performanceDraft}
                onChange={(e) => setPerformanceDraft(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="이 업무에서 어필할 성과를 입력하세요 (선택)"
                autoFocus
              />
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={closePerformanceModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={savePerformance}
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
