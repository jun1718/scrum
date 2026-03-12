import type { Report, ReportDetail, ReportTag } from '@/types'

interface ReportTableProps {
  reports: Report[]
  getDetails: (reportId: number) => ReportDetail[]
  getReportTags?: (reportId: number) => ReportTag[]
  showAiSummary?: boolean
  onEdit?: (report: Report) => void
  onDelete?: (report: Report) => void
  type: 'daily' | 'weekly' | 'monthly' | 'review'
  onReportClick?: (report: Report) => void
  onView?: (report: Report) => void
}

export function ReportTable({
  reports,
  getDetails,
  getReportTags = () => [],
  showAiSummary = false,
  onEdit,
  onDelete,
  type,
  onReportClick,
  onView,
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
              {type === 'daily' ? '상세' : '업무 목록'}
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
            const rowCount = Math.max(1, details.length)
            return details.length === 0 ? (
              <tr
                key={report.reportId}
                className={onReportClick ? 'hover:bg-blue-50 cursor-pointer' : 'hover:bg-gray-50'}
                onClick={onReportClick ? () => onReportClick(report) : undefined}
              >
                <td className="px-4 py-3 text-sm text-gray-700">{report.staDate}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{report.endDate}</td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {type === 'daily' ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="px-2 py-1 rounded border border-gray-300 text-xs text-gray-700 bg-white hover:bg-gray-50"
                      >
                        동료 협업
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1 rounded border border-gray-300 text-xs text-gray-700 bg-white hover:bg-gray-50"
                      >
                        성과 보기
                      </button>
                    </div>
                  ) : (
                    '—'
                  )}
                </td>
                {(type === 'weekly' || type === 'monthly' || type === 'review') && (
                  <td className="px-4 py-3 text-sm">—</td>
                )}
                {showAiSummary && <td className="px-4 py-3 text-sm">—</td>}
                {(onEdit || onDelete || onView) && (
                  <td className="px-4 py-3 text-right space-x-2">
                    {onView && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onView(report)
                        }}
                        className="text-gray-600 hover:underline text-sm"
                      >
                        조회
                      </button>
                    )}
                    {onEdit && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(report)
                        }}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        수정
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(report)
                        }}
                        className="text-red-600 hover:underline text-sm"
                      >
                        삭제
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ) : (
              details.map((d, idx) => (
                <tr
                  key={`${report.reportId}-${d.reportDetailId}`}
                  className={onReportClick ? 'hover:bg-blue-50 cursor-pointer' : 'hover:bg-gray-50'}
                  onClick={onReportClick ? () => onReportClick(report) : undefined}
                >
                  {idx === 0 && (
                    <>
                      <td rowSpan={rowCount} className="px-4 py-3 text-sm text-gray-700 align-top border-r border-gray-100">
                        {report.staDate}
                      </td>
                      <td rowSpan={rowCount} className="px-4 py-3 text-sm text-gray-700 align-top border-r border-gray-100">
                        {report.endDate}
                      </td>
                    </>
                  )}
                  <td className="px-4 py-3 text-sm align-top">
                    {type === 'daily' ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="px-2 py-1 rounded border border-gray-300 text-xs text-gray-700 bg-white hover:bg-gray-50"
                        >
                          동료 협업
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 rounded border border-gray-300 text-xs text-gray-700 bg-white hover:bg-gray-50"
                        >
                          성과 보기
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-gray-900">{d.taskTitle || '—'}</span>
                        {d.taskLink ? (
                          <a
                            href={d.taskLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-xs break-all"
                          >
                            {d.taskLink}
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </div>
                    )}
                  </td>
                  {(type === 'weekly' || type === 'monthly' || type === 'review') && idx === 0 && (
                    <td rowSpan={rowCount} className="px-4 py-3 text-sm align-top border-r border-gray-100">
                      <ul className="space-y-1">
                        {reportTags.map((rt) => (
                          <li key={rt.reportTagId}>태그#{rt.tagId}: {rt.workHours}h</li>
                        ))}
                      </ul>
                    </td>
                  )}
                  {showAiSummary && idx === 0 && (
                    <td rowSpan={rowCount} className="px-4 py-3 text-sm text-gray-600 max-w-xs align-top border-r border-gray-100">
                      {reportTags.map((rt) =>
                        rt.aiSummaryContent ? (
                          <div key={rt.reportTagId} className="mb-2">{rt.aiSummaryContent}</div>
                        ) : null
                      )}
                    </td>
                  )}
                  {(onEdit || onDelete || onView) && idx === 0 && (
                    <td rowSpan={rowCount} className="px-4 py-3 text-right space-x-2 align-top">
                      {onView && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onView(report)
                          }}
                          className="text-gray-600 hover:underline text-sm"
                        >
                          조회
                        </button>
                      )}
                      {onEdit && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit(report)
                          }}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          수정
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(report)
                          }}
                          className="text-red-600 hover:underline text-sm"
                        >
                          삭제
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
