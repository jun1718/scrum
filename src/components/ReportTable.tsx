import { useState } from 'react'
import type { Report, ReportDetail, ReportDetailTag, Tag } from '@/types'
import { calcWorkRate, sumWorkHours } from '@/utils/calc'

interface ReportTableProps {
  reports: Report[]
  getDetails: (reportId: number) => ReportDetail[]
  getReportDetailTags?: (reportId: number) => ReportDetailTag[]
  showAiSummary?: boolean
  onEdit?: (report: Report) => void
  onDelete?: (report: Report) => void
  type: 'daily' | 'weekly' | 'monthly' | 'review'
  onReportClick?: (report: Report) => void
  onView?: (report: Report) => void
  onPeerReport?: (report: Report) => void
  onTomorrow?: (report: Report) => void
  onPerformance?: (report: Report, detail: ReportDetail) => void
  tags?: Tag[]
}

export function ReportTable({
  reports,
  getDetails,
  getReportDetailTags = () => [],
  showAiSummary = false,
  onEdit,
  onDelete,
  type,
  onReportClick,
  onView,
  onPeerReport,
  onTomorrow,
  onPerformance,
  tags = [],
}: ReportTableProps) {
  const [expandedTag, setExpandedTag] = useState<{ reportId: number; tagId: number } | null>(null)

  const getTagName = (tagId: number) => tags.find((t) => t.tagId === tagId)?.tagName ?? `태그#${tagId}`

  const sorted = [...reports].sort(
    (a, b) => new Date(b.staDate).getTime() - new Date(a.staDate).getTime()
  )

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">아직 보고가 없습니다.</div>
    )
  }

  /* ── 성과보고: report_detail_tag 기반 테이블 ── */
  if (type === 'review') {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300 select-none border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-300">시작일</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-300">종료일</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-300">월간태그명</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-300">투입시간</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-300">투입률(%)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-300">AI 요약</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-300">
            {sorted.map((report) => {
              const rTags = getReportDetailTags(report.reportId)
              const totalTagHours = rTags.reduce((sum, rt) => sum + rt.workHours, 0)
              const rowCount = Math.max(1, rTags.length)
              const details = getDetails(report.reportId)

              return rTags.length === 0 ? (
                <tr key={report.reportId}>
                  <td className="px-4 py-3 text-sm text-gray-700">{report.staDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{report.endDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-400" colSpan={4}>—</td>
                  <td className="px-3 py-2">
                    {onDelete && (
                      <button type="button" onClick={() => onDelete(report)} className="w-full px-3 py-1.5 rounded border border-red-400 text-sm text-red-700 bg-red-50 hover:bg-red-100 font-medium whitespace-nowrap">삭제</button>
                    )}
                  </td>
                </tr>
              ) : (
                rTags.map((rt, idx) => {
                  const tagRate = totalTagHours > 0 ? Math.round((rt.workHours / totalTagHours) * 100) : 0
                  const isExpanded = expandedTag?.reportId === report.reportId && expandedTag?.tagId === rt.tagId
                  const tagDetails = details.filter((d) => d.tagId === rt.tagId)

                  return (
                    <tr key={`${report.reportId}-${rt.reportDetailTagId}`}>
                      {idx === 0 && (
                        <>
                          <td rowSpan={rowCount} className="px-4 py-3 text-sm text-gray-700 align-top border-r border-gray-300">{report.staDate}</td>
                          <td rowSpan={rowCount} className="px-4 py-3 text-sm text-gray-700 align-top border-r border-gray-300">{report.endDate}</td>
                        </>
                      )}
                      <td className="px-4 py-3 text-sm border-r border-gray-300">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{getTagName(rt.tagId)}</span>
                          <button
                            type="button"
                            onClick={() => setExpandedTag(isExpanded ? null : { reportId: report.reportId, tagId: rt.tagId })}
                            className="px-2 py-0.5 rounded border border-blue-200 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100"
                          >
                            {isExpanded ? '접기' : '상세보기'}
                          </button>
                        </div>
                        {isExpanded && (
                          <div className="mt-3 border-t pt-2">
                            <p className="text-xs text-gray-400 mb-2">이 태그의 업무별 AI 요약과 어필할 성과를 합쳐 태그별 AI 요약이 생성되었습니다.</p>
                            <table className="w-full text-xs border border-gray-200 rounded">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-2 py-1 text-left border-r">업무명</th>
                                  <th className="px-2 py-1 text-left border-r">한 일</th>
                                  <th className="px-2 py-1 text-left border-r">업무별 AI 요약</th>
                                  <th className="px-2 py-1 text-left">어필할 성과</th>
                                </tr>
                              </thead>
                              <tbody>
                                {tagDetails.map((d) => (
                                  <tr key={d.reportDetailId} className="border-t border-gray-100">
                                    <td className="px-2 py-1 border-r">
                                      {d.taskLink && d.taskLink !== '#' ? (
                                        <a href={d.taskLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{d.taskTitle}</a>
                                      ) : d.taskTitle}
                                    </td>
                                    <td className="px-2 py-1 border-r whitespace-pre-line">{d.done}</td>
                                    <td className="px-2 py-1 border-r whitespace-pre-line">{d.aiSummary || '—'}</td>
                                    <td className="px-2 py-1 whitespace-pre-line">{d.performance || '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300">{rt.workHours}h</td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300">{tagRate}%</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs border-r border-gray-300 whitespace-pre-line">{rt.aiSummary || '—'}</td>
                      {idx === 0 && (
                        <td rowSpan={rowCount} className="px-3 py-2 align-middle">
                          {onDelete && (
                            <button type="button" onClick={() => onDelete(report)} className="w-full px-3 py-1.5 rounded border border-red-400 text-sm text-red-700 bg-red-50 hover:bg-red-100 font-medium whitespace-nowrap">삭제</button>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-300 select-none border border-gray-300${type === 'daily' ? ' table-fixed' : ''}`}>
        {type === 'daily' && (
          <colgroup>
            <col className="w-[10%]" />
            <col className="w-[6%]" />
            <col className="w-[18%]" />
            <col className="w-[10%]" />
            <col className="w-[7%]" />
            <col className="w-[34%]" />
            <col className="w-[15%]" />
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-300 whitespace-nowrap">
                  업무 성과
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-300 whitespace-nowrap">
                  투입률
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-300">
                  해당 업무로 한 일
                </th>
              </>
            )}
            {(type === 'weekly' || type === 'monthly') && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-300">
                태그별 투입시간
              </th>
            )}
            {showAiSummary && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-300">
                AI 요약
              </th>
            )}
            {(onEdit || onDelete || onPeerReport || onTomorrow) && (
              <th className="px-4 py-3"></th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-300">
          {sorted.map((report) => {
            const details = getDetails(report.reportId)
            const reportDetailTags = getReportDetailTags(report.reportId)
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
                    <td className="px-4 py-3 text-sm text-gray-400 align-middle border-r border-gray-300">—</td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-sm text-gray-700">{report.staDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{report.endDate}</td>
                  </>
                )}
                <td className="px-4 py-3 text-sm text-gray-400 border-r border-gray-300">—</td>
                {type === 'daily' && (
                  <>
                    <td className="px-4 py-3 text-sm text-gray-400 border-r border-gray-300">—</td>
                    <td className="px-4 py-3 text-sm text-gray-400 border-r border-gray-300">—</td>
                    <td className="px-4 py-3 text-sm text-gray-400 border-r border-gray-300">—</td>
                  </>
                )}
                {(type === 'weekly' || type === 'monthly') && (
                  <td className="px-4 py-3 text-sm">—</td>
                )}
                {showAiSummary && <td className="px-4 py-3 text-sm">—</td>}
                {(onEdit || onDelete || onView || onPeerReport || onTomorrow) && (
                  <td className="px-3 py-2 align-middle">
                    <div className="flex flex-col gap-2.5">
                      {onView && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onView(report) }}
                          className="w-full px-3 py-1.5 rounded border border-gray-400 text-sm text-gray-700 bg-white hover:bg-gray-100 font-medium whitespace-nowrap"
                        >
                          업무 상세 보기
                        </button>
                      )}
                      {onEdit && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onEdit(report) }}
                          className="w-full px-3 py-1.5 rounded border border-blue-400 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 font-medium whitespace-nowrap"
                        >
                          수정
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onDelete(report) }}
                          className="w-full px-3 py-1.5 rounded border border-red-400 text-sm text-red-700 bg-red-50 hover:bg-red-100 font-medium whitespace-nowrap"
                        >
                          삭제
                        </button>
                      )}
                      {onPeerReport && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onPeerReport(report) }}
                          className="w-full px-3 py-1.5 rounded border border-purple-400 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 font-medium whitespace-nowrap"
                        >
                          동료 협업 기록
                        </button>
                      )}
                      {onTomorrow && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onTomorrow(report) }}
                          className="w-full px-3 py-1.5 rounded border border-green-400 text-sm text-green-700 bg-green-50 hover:bg-green-100 font-medium whitespace-nowrap"
                        >
                          내일 할 일
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
                        <td rowSpan={rowCount} className="px-4 py-3 text-sm text-gray-700 align-middle border-r border-gray-300">
                          {report.staDate}
                        </td>
                        <td rowSpan={rowCount} className="px-4 py-3 text-sm text-gray-700 align-middle border-r border-gray-300 text-center font-medium">
                          {totalHours}h
                        </td>
                      </>
                    ) : (
                      <>
                        <td rowSpan={rowCount} className="px-4 py-3 text-sm text-gray-700 align-top border-r border-gray-300">
                          {report.staDate}
                        </td>
                        <td rowSpan={rowCount} className="px-4 py-3 text-sm text-gray-700 align-top border-r border-gray-300">
                          {report.endDate}
                        </td>
                      </>
                    )
                  )}
                  <td className="px-4 py-3 text-sm align-middle border-r border-gray-300">
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
                      <td className="px-4 py-3 text-sm align-middle border-r border-gray-300">
                        {onPerformance ? (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onPerformance(report, d) }}
                            className={`w-full px-3 py-1.5 rounded border text-sm font-medium whitespace-nowrap ${
                              d.performance
                                ? 'border-blue-400 text-blue-700 bg-blue-50 hover:bg-blue-100'
                                : 'border-orange-400 text-orange-700 bg-orange-50 hover:bg-orange-100'
                            }`}
                          >
                            {d.performance ? '성과 수정' : '성과 입력'}
                          </button>
                        ) : (
                          <span className="text-sm text-gray-500 whitespace-pre-line">{d.performance || '—'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm align-middle text-center border-r border-gray-300">
                        <span className="text-gray-700">{d.workHours}h</span>
                        <span className="text-gray-400 ml-1">({calcWorkRate(d.workHours, totalHours)}%)</span>
                      </td>
                      <td className="px-4 py-3 text-sm align-middle text-gray-700 whitespace-pre-line border-r border-gray-300">
                        {d.done || '—'}
                      </td>
                    </>
                  )}
                  {(type === 'weekly' || type === 'monthly') && idx === 0 && (
                    <td rowSpan={rowCount} className="px-4 py-3 text-sm align-top border-r border-gray-300">
                      <ul className="space-y-1">
                        {reportDetailTags.map((rt) => (
                          <li key={rt.reportDetailTagId}>태그#{rt.tagId}: {rt.workHours}h</li>
                        ))}
                      </ul>
                    </td>
                  )}
                  {showAiSummary && idx === 0 && (
                    <td rowSpan={rowCount} className="px-4 py-3 text-sm text-gray-600 max-w-xs align-top border-r border-gray-300">
                      {reportDetailTags.map((rt) =>
                        rt.aiSummary ? (
                          <div key={rt.reportDetailTagId} className="mb-2">{rt.aiSummary}</div>
                        ) : null
                      )}
                    </td>
                  )}
                  {(onEdit || onDelete || onView || onPeerReport || onTomorrow) && idx === 0 && (
                    <td rowSpan={rowCount} className="px-3 py-2 align-middle">
                      <div className="flex flex-col gap-2.5">
                        {onView && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onView(report) }}
                            className="w-full px-3 py-1.5 rounded border border-gray-400 text-sm text-gray-700 bg-white hover:bg-gray-100 font-medium whitespace-nowrap"
                          >
                            업무 상세 보기
                          </button>
                        )}
                        {onEdit && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onEdit(report) }}
                            className="w-full px-3 py-1.5 rounded border border-blue-400 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 font-medium whitespace-nowrap"
                          >
                            수정
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onDelete(report) }}
                            className="w-full px-3 py-1.5 rounded border border-red-400 text-sm text-red-700 bg-red-50 hover:bg-red-100 font-medium whitespace-nowrap"
                          >
                            삭제
                          </button>
                        )}
                        {onPeerReport && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onPeerReport(report) }}
                            className="w-full px-3 py-1.5 rounded border border-purple-400 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 font-medium whitespace-nowrap"
                          >
                            동료 협업 기록
                          </button>
                        )}
                        {onTomorrow && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onTomorrow(report) }}
                            className="w-full px-3 py-1.5 rounded border border-green-400 text-sm text-green-700 bg-green-50 hover:bg-green-100 font-medium whitespace-nowrap"
                          >
                            내일 할 일
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
