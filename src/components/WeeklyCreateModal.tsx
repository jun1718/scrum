import { useState, useMemo } from 'react'

interface WeeklyCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (staDate: string, endDate: string) => void
  weekStartDay: number
  existingRanges?: { staDate: string; endDate: string }[]
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

function toLocalDateStr(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getWeekRange(dateStr: string, weekStartDay: number) {
  const date = new Date(dateStr + 'T00:00:00')
  const dayOfWeek = date.getDay()
  const diff = (dayOfWeek - weekStartDay + 7) % 7
  const sta = new Date(date)
  sta.setDate(sta.getDate() - diff)
  const end = new Date(sta)
  end.setDate(end.getDate() + 6)
  return {
    staDate: toLocalDateStr(sta),
    endDate: toLocalDateStr(end),
  }
}

export function WeeklyCreateModal({
  isOpen,
  onClose,
  onCreate,
  weekStartDay,
  existingRanges = [],
}: WeeklyCreateModalProps) {
  const today = new Date().toISOString().slice(0, 10)
  const [selectedDate, setSelectedDate] = useState(today)
  const [error, setError] = useState('')

  const weekRange = useMemo(
    () => getWeekRange(selectedDate, weekStartDay),
    [selectedDate, weekStartDay]
  )

  const weekEndDay = (weekStartDay + 6) % 7

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
    if (overlaps(weekRange.staDate, weekRange.endDate)) {
      setError('해당 기간의 주간 보고가 이미 존재합니다.')
      return
    }
    onCreate(weekRange.staDate, weekRange.endDate)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">주간 보고 생성</h2>
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
            날짜를 선택하면 팀 설정 기준({DAY_LABELS[weekStartDay]}~{DAY_LABELS[weekEndDay]})으로 해당 주의 시작/종료일이 자동 계산됩니다.
          </p>
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1">기준 날짜 선택</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setError('') }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="grid gap-4 grid-cols-2 mb-2">
            <div className="bg-gray-50 rounded-md px-3 py-2">
              <label className="block text-xs text-gray-500 mb-1">시작일 ({DAY_LABELS[weekStartDay]})</label>
              <p className="text-sm font-medium text-gray-800">{weekRange.staDate}</p>
            </div>
            <div className="bg-gray-50 rounded-md px-3 py-2">
              <label className="block text-xs text-gray-500 mb-1">종료일 ({DAY_LABELS[weekEndDay]})</label>
              <p className="text-sm font-medium text-gray-800">{weekRange.endDate}</p>
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
              주간 보고 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
