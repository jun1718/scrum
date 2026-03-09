import { useState } from 'react'

interface ReviewCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (staDate: string, endDate: string) => void
  existingRanges?: { staDate: string; endDate: string }[]
}

export function ReviewCreateModal({
  isOpen,
  onClose,
  onCreate,
  existingRanges = [],
}: ReviewCreateModalProps) {
  const currentYear = new Date().getFullYear()
  const [staDate, setStaDate] = useState(`${currentYear}-01-01`)
  const [endDate, setEndDate] = useState(`${currentYear}-12-31`)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const overlaps = (s: string, e: string) =>
    existingRanges.some(
      (r) =>
        (s >= r.staDate && s <= r.endDate) ||
        (e >= r.staDate && e <= r.endDate) ||
        (s <= r.staDate && e >= r.endDate)
    )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (staDate > endDate) {
      setError('시작일이 종료일보다 늦을 수 없습니다.')
      return
    }
    if (overlaps(staDate, endDate)) {
      setError('이미 생성된 범위와 겹칩니다.')
      return
    }
    onCreate(staDate, endDate)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">성과 보고 생성</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <p className="text-sm text-gray-500 mb-3">
            시작일·종료일을 지정하여 성과 보고를 생성합니다. (기본 1/1~12/31)
          </p>
          <div className="grid gap-4 grid-cols-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">시작일</label>
              <input
                type="date"
                value={staDate}
                onChange={(e) => setStaDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">종료일</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          <div className="mt-6 flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
            >
              성과 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
