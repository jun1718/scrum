import type { ReportDetail } from '@/types'
import { calcWorkRate } from '@/utils/calc'

interface ReviewDetailModalProps {
  isOpen: boolean
  onClose: () => void
  tagName: string
  details: ReportDetail[]
  totalHours: number
}

export function ReviewDetailModal({
  isOpen,
  onClose,
  tagName,
  details,
  totalHours,
}: ReviewDetailModalProps) {
  if (!isOpen) return null

  const thClass = 'px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase border-r border-gray-300 whitespace-nowrap tracking-wide'
  const thLeftClass = 'px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase border-r border-gray-300 whitespace-nowrap tracking-wide'

  const sorted = [...details].sort((a, b) => b.workHours - a.workHours)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-16 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full mx-4 flex flex-col" style={{ maxHeight: '80vh' }}>
        <div className="px-6 py-4 border-b flex justify-between items-center shrink-0">
          <div>
            <h2 className="font-semibold text-lg">{tagName} — 상세보기</h2>
            <p className="text-xs text-gray-400 mt-0.5">이 태그의 업무별 AI 요약과 어필할 성과를 합쳐 태그별 AI 요약이 생성되었습니다.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none px-2"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          <table className="min-w-full divide-y divide-gray-300 select-none border border-gray-300 table-fixed">
            <colgroup>
              <col className="w-[20%]" />
              <col className="w-[8%]" />
              <col className="w-[30%]" />
              <col className="w-[22%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead className="bg-gray-200">
              <tr>
                <th className={thLeftClass}>업무명</th>
                <th className={thClass}>투입률</th>
                <th className={thLeftClass}>AI 요약</th>
                <th className={thLeftClass}>한 일</th>
                <th className={`${thLeftClass} !border-r-0`}>업무 성과</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-300">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-sm text-gray-400 text-center">데이터가 없습니다.</td>
                </tr>
              ) : (
                sorted.map((d) => (
                  <tr key={d.reportDetailId}>
                    <td className="px-4 py-3 text-sm align-top border-r border-gray-300">
                      {d.taskLink && d.taskLink !== '#' ? (
                        <a href={d.taskLink} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">{d.taskTitle || '—'}</a>
                      ) : (
                        <span className="font-medium text-gray-900">{d.taskTitle || '—'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-center align-top border-r border-gray-300">
                      <span className="text-gray-700">{d.workHours}h</span>
                      <span className="text-gray-400 ml-1">({calcWorkRate(d.workHours, totalHours)}%)</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 align-top border-r border-gray-300 whitespace-pre-line">{d.aiSummary || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 align-top border-r border-gray-300 whitespace-pre-line">{d.done || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 align-top whitespace-pre-line">{d.performance || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
