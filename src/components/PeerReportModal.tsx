import type { Member, PeerReport } from '@/types'

interface PeerReportModalProps {
  isOpen: boolean
  onClose: () => void
  peerReports: PeerReport[]
  teamMembers: Member[]
  currentMemberId: number
  onSave: (reportId: number, peerMemberId: number, content: string) => void
  onDelete: (peerReportId: number) => void
  reportId: number | null
}

export function PeerReportModal({
  isOpen,
  onClose,
  peerReports,
  teamMembers,
  currentMemberId,
  onSave,
  onDelete,
  reportId,
}: PeerReportModalProps) {
  if (!isOpen) return null

  const peers = teamMembers.filter((m) => m.memberId !== currentMemberId)
  const reportsForCurrent = reportId
    ? peerReports.filter((pr) => pr.reportId === reportId)
    : []

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">동료 협업 기록</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {reportId ? (
            <>
              <p className="text-sm text-gray-500 mb-3">
                팀 동료와의 협업 내용을 기록합니다.
              </p>
              {reportsForCurrent.map((pr) => {
                const peer = teamMembers.find((m) => m.memberId === pr.peerMemberId)
                return (
                  <div
                    key={pr.peerReportId}
                    className="border border-gray-200 rounded-lg p-3 mb-2"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm">{peer?.memberName ?? pr.peerMemberId}</span>
                      <button
                        type="button"
                        onClick={() => onDelete(pr.peerReportId)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        삭제
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{pr.content ?? '—'}</p>
                  </div>
                )
              })}
              <form
                className="mt-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  const form = e.currentTarget
                  const peerId = Number((form.querySelector('[name=peerMemberId]') as HTMLSelectElement).value)
                  const content = (form.querySelector('[name=content]') as HTMLInputElement).value
                  if (peerId && content.trim()) {
                    onSave(reportId, peerId, content.trim())
                    form.reset()
                  }
                }}
              >
                <label className="block text-xs text-gray-500 mb-1">동료 선택</label>
                <select
                  name="peerMemberId"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-2"
                  required
                >
                  <option value="">선택</option>
                  {peers.map((m) => (
                    <option key={m.memberId} value={m.memberId}>
                      {m.memberName}
                    </option>
                  ))}
                </select>
                <label className="block text-xs text-gray-500 mb-1">협업 내용</label>
                <textarea
                  name="content"
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  required
                />
                <div className="mt-3 flex justify-end gap-2">
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
                    저장
                  </button>
                </div>
              </form>
            </>
          ) : (
            <p className="text-gray-500">먼저 데일리 슈크럼을 저장해주세요.</p>
          )}
        </div>
      </div>
    </div>
  )
}
