import type { Report, ReportDetail, ReportTag } from '@/types'
import { calcWorkRate, sumWorkHours } from '@/utils/calc'

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
  onPeerReport?: (report: Report) => void
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
  onPeerReport,
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
      <table className={`min-w-full divide-y divide-gray-200 select-none${type === 'daily' ? ' table-fixed' : ''}`}>
        {type === 'daily' && (
          <colgroup>
            <col className="w-[10%]" />
            <col className="w-[6%]" />
            <col className="w-[22%]" />
            <col className="w-[8%]" />
            <col className="w-[42%]" />
            <col className="w-[12%]" />
          </colgroup>
        )}
        <thead className="bg-gray-50">
          <tr>
            {type === 'daily' ? (
              <>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-300">
                  근무 한 날
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-300 whitespace-nowrap">
                  총 투입
                </th>
              </>
            ) : (
              <>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-300">
                  시작일
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-300">
                  종료일
                </th>
              </>
            )}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-300">
              {type === 'daily' ? '업무명' : '업무 목록'}
            </th>
            {type === 'daily' && (
              <>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-300 whitespace-nowrap">
                  투입률
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-300">
                  업무 내용
                </th>
              </>
            )}
            {(type === 'weekly' || type === 'monthly' || type === 'review') && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-300">
                태그별 투입시간
              </th>
            )}
            {showAiSummary && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-300">
                AI 요약
              </th>
            )}
            {(onEdit || onDelete || onPeerReport) && (
              <th className="px-4 py-3"></th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {sorted.map((report) => {
            const details = getDetails(report.reportId)
            const reportTags = getReportTags(report.reportId)
            const rowCount = Math.max(1, details.length)
            const totalHours = type === 'daily' ? sumWorkHours(details) : 0
            return details.length === 0 ? (
              <tr
                key={report.reportId}
                className={onReportClick ? 'hover:bg-blue-50 cursor-pointer' : ''}
                onClick={onReportClick ? () => onReportClick(report) : undefined}
              >
                {type === 'daily' ? (
                  <>
                    <td className="px-4 py-3 text-sm text-gray-700 align-middle">{report.staDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-400 align-middle border-r border-gray-100">—</td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-sm text-gray-700">{report.staDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{report.endDate}</td>
                  </>
                )}
                <td className="px-4 py-3 text-sm text-gray-400 border-r border-gray-200">—</td>
                {type === 'daily' && (
                  <>
                    <td className="px-4 py-3 text-sm text-gray-400 border-r border-gray-200">—</td>
                    <td className="px-4 py-3 text-sm text-gray-400 border-r border-gray-200">—</td>
                  </>
                )}
                {(type === 'weekly' || type === 'monthly' || type === 'review') && (
                  <td className="px-4 py-3 text-sm">—</td>
                )}
                {showAiSummary && <td className="px-4 py-3 text-sm">—</td>}
                {(onEdit || onDelete || onView || onPeerReport) && (
                  <td className="px-3 py-2 align-middle">
                    <div className="flex flex-wrap gap-1 justify-start">
                      {onView && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onView(report) }}
                          className="px-2 py-1 rounded border border-gray-200 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100"
                        >
                          상세
                        </button>
                      )}
                      {onEdit && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onEdit(report) }}
                          className="px-2 py-1 rounded border border-blue-200 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100"
                        >
                          수정
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onDelete(report) }}
                          className="px-2 py-1 rounded border border-red-200 text-xs text-red-600 bg-red-50 hover:bg-red-100"
                        >
                          삭제
                        </button>
                      )}
                      {onPeerReport && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onPeerReport(report) }}
                          className="px-2 py-1 rounded border border-purple-200 text-xs text-purple-600 bg-purple-50 hover:bg-purple-100"
                        >
                          협업
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ) : (
              details.map((d, idx) => (
                <tr
                  key={`${report.reportId}-${d.reportDetailId}`}
                  className={onReportClick ? 'hover:bg-blue-50 cursor-pointer' : ''}
                  onClick={onReportClick ? () => onReportClick(report) : undefined}
                >
                  {idx === 0 && (
                    type === 'daily' ? (
                      <>
                        <td rowSpan={rowCount} className="px-4 py-3 text-sm text-gray-700 align-middle border-r border-gray-100">
                          {report.staDate}
                        </td>
                        <td rowSpan={rowCount} className="px-4 py-3 text-sm text-gray-700 align-middle border-r border-gray-100 text-center font-medium">
                          {totalHours}h
                        </td>
                      </>
                    ) : (
                      <>
                        <td rowSpan={rowCount} className="px-4 py-3 text-sm text-gray-700 align-top border-r border-gray-100">
                          {report.staDate}
                        </td>
                        <td rowSpan={rowCount} className="px-4 py-3 text-sm text-gray-700 align-top border-r border-gray-100">
                          {report.endDate}
                        </td>
                      </>
                    )
                  )}
                  <td className="px-4 py-3 text-sm align-middle border-r border-gray-200">
                    {d.taskLink && d.taskLink !== '#' ? (
                      <a
                        href={d.taskLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {d.taskTitle || '—'}
                      </a>
                    ) : (
                      <span className="font-medium text-gray-900">{d.taskTitle || '—'}</span>
                    )}
                  </td>
                  {type === 'daily' && (
                    <>
                      <td className="px-4 py-3 text-sm align-middle text-center border-r border-gray-200">
                        <span className="text-gray-700">{d.workHours}h</span>
                        <span className="text-gray-400 ml-1">({calcWorkRate(d.workHours, totalHours)}%)</span>
                      </td>
                      <td className="px-4 py-3 text-sm align-middle text-gray-700 whitespace-pre-line border-r border-gray-200">
                        {d.done || '—'}
                      </td>
                    </>
                  )}
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
                  {(onEdit || onDelete || onView || onPeerReport) && idx === 0 && (
                    <td rowSpan={rowCount} className="px-3 py-2 align-middle">
                      <div className="flex flex-wrap gap-1 justify-start">
                        {onView && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onView(report) }}
                            className="px-2 py-1 rounded border border-gray-200 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100"
                          >
                            상세
                          </button>
                        )}
                        {onEdit && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onEdit(report) }}
                            className="px-2 py-1 rounded border border-blue-200 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100"
                          >
                            수정
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onDelete(report) }}
                            className="px-2 py-1 rounded border border-red-200 text-xs text-red-600 bg-red-50 hover:bg-red-100"
                          >
                            삭제
                          </button>
                        )}
                        {onPeerReport && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onPeerReport(report) }}
                            className="px-2 py-1 rounded border border-purple-200 text-xs text-purple-600 bg-purple-50 hover:bg-purple-100"
                          >
                            협업
                          </button>
                        )}
                      </div>
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
