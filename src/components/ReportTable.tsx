import type { Report, ReportDetail, ReportTag } from '@/types'

interface ReportTableProps {
  reports: Report[]
  getDetails: (reportId: number) => ReportDetail[]
  getReportTags?: (reportId: number) => ReportTag[]
  showAiSummary?: boolean
  onEdit?: (report: Report) => void
  onDelete?: (report: Report) => void
  type: 'daily' | 'weekly' | 'monthly' | 'review'
}

export function ReportTable({
  reports,
  getDetails,
  getReportTags = () => [],
  showAiSummary = false,
  onEdit,
  onDelete,
  type,
}: ReportTableProps) {
  const sorted = [...reports].sort(
    (a, b) => new Date(b.staDate).getTime() - new Date(a.staDate).getTime()
  )

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">아직 보고가 없습니다.</div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              시작일
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              종료일
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              업무 목록
            </th>
            {(type === 'weekly' || type === 'monthly' || type === 'review') && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                태그별 투입시간
              </th>
            )}
            {showAiSummary && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                AI 요약
              </th>
            )}
            {(onEdit || onDelete) && (
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                작업
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {sorted.map((report) => {
            const details = getDetails(report.reportId)
            const reportTags = getReportTags(report.reportId)
            return (
              <tr key={report.reportId} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700">{report.staDate}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{report.endDate}</td>
                <td className="px-4 py-3 text-sm">
                  <ul className="list-disc list-inside space-y-1">
                    {details.map((d) => (
                      <li key={d.reportDetailId}>
                        {d.taskTitle} — {d.done} ({d.workHours}h)
                      </li>
                    ))}
                  </ul>
                </td>
                {(type === 'weekly' || type === 'monthly' || type === 'review') && (
                  <td className="px-4 py-3 text-sm">
                    <ul className="space-y-1">
                      {reportTags.map((rt) => (
                        <li key={rt.reportTagId}>
                          태그#{rt.tagId}: {rt.workHours}h
                        </li>
                      ))}
                    </ul>
                  </td>
                )}
                {showAiSummary && (
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                    {reportTags.map((rt) =>
                      rt.aiSummaryContent ? (
                        <div key={rt.reportTagId} className="mb-2">
                          {rt.aiSummaryContent}
                        </div>
                      ) : null
                    )}
                  </td>
                )}
                {(onEdit || onDelete) && (
                  <td className="px-4 py-3 text-right space-x-2">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(report)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        수정
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(report)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        삭제
                      </button>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
