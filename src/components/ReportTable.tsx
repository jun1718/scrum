import { useState } from 'react'
import type { Report, ReportDetail, ReportDetailTag, Tag } from '@/types'
import { calcWorkRate, sumWorkHours } from '@/utils/calc'
import { ReviewDetailModal } from './ReviewDetailModal'

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
  hidePerformance?: boolean
  showTomorrowPlan?: boolean
  aiSummaryLabel?: string
  onAiSummaryEdit?: (detail: ReportDetail, newValue: string) => void
  onReviewTagAiSummaryEdit?: (rt: ReportDetailTag, newValue: string) => void
  memberName?: string
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
  hidePerformance = false,
  showTomorrowPlan = false,
  aiSummaryLabel,
  onAiSummaryEdit,
  onReviewTagAiSummaryEdit,
  memberName,
}: ReportTableProps) {
  const [reviewDetailModal, setReviewDetailModal] = useState<{ tagName: string; details: ReportDetail[]; totalHours: number } | null>(null)
  const [expandedDone, setExpandedDone] = useState<Set<number>>(new Set())
  const [editingAiSummary, setEditingAiSummary] = useState<{ detailId: number; value: string } | null>(null)
  const [editingReviewTagAi, setEditingReviewTagAi] = useState<{ tagId: number; value: string } | null>(null)

  const getTagName = (tagId: number) => tags.find((t) => t.tagId === tagId)?.tagName ?? `태그#${tagId}`

  const getGroupTagForDetail = (detail: ReportDetail) => {
    const detailTag = tags.find((t) => t.tagId === detail.tagId)
    if (!detailTag) return null
    if (type === 'daily') {
      // 일간 보고: 주간 태그(detail의 태그 자체)로 그룹핑
      return detailTag
    }
    // 주간/월간 보고: 월간 태그(부모 태그)로 그룹핑
    if (!detailTag.parentTagId) return detailTag // 이미 월간 태그인 경우
    return tags.find((t) => t.tagId === detailTag.parentTagId) ?? null
  }

  const groupDetailsByTag = (details: ReportDetail[]) => {
    const groupMap = new Map<number, { tagName: string; details: ReportDetail[]; totalHours: number }>()
    const order: number[] = []
    for (const d of details) {
      const gt = getGroupTagForDetail(d)
      const key = gt?.tagId ?? 0
      if (!groupMap.has(key)) {
        groupMap.set(key, { tagName: gt?.tagName ?? '미분류', details: [], totalHours: 0 })
        order.push(key)
      }
      const g = groupMap.get(key)!
      g.details.push(d)
      g.totalHours += d.workHours
    }
    const groups = order.map((k) => groupMap.get(k)!)
    // 태그별 투입시간 내림차순 정렬
    groups.sort((a, b) => b.totalHours - a.totalHours)
    // 태그 내 업무별 투입시간 내림차순 정렬
    for (const g of groups) {
      g.details.sort((a, b) => b.workHours - a.workHours)
    }
    return groups
  }

  const sorted = [...reports].sort(
    (a, b) => new Date(b.staDate).getTime() - new Date(a.staDate).getTime()
  )

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">아직 보고가 없습니다.</div>
    )
  }

  /* ── 성과보고: report_detail_tag 기반 테이블 (월간 스타일) ── */
  if (type === 'review') {
    const reviewThClass = 'px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase border-r border-gray-300 whitespace-nowrap tracking-wide'
    const reviewThLeftClass = 'px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase border-r border-gray-300 whitespace-nowrap tracking-wide'
    const reviewTableClass = 'min-w-full divide-y divide-gray-300 select-none border border-gray-300 table-fixed'

    return (
      <div className="overflow-x-auto space-y-5">
        {sorted.map((report) => {
          const rTags = [...getReportDetailTags(report.reportId)].sort((a, b) => b.workHours - a.workHours)
          const totalTagHours = rTags.reduce((sum, rt) => sum + rt.workHours, 0)
          const details = getDetails(report.reportId)

          return (
            <div key={report.reportId}>
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-base font-bold text-gray-900">
                  {report.staDate} ~ {report.endDate} (투입 시간 : {totalTagHours}h)
                </h3>
                <div className="flex gap-2">
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(report)}
                      className="px-3 py-1.5 rounded border border-red-400 text-sm text-red-700 bg-red-50 hover:bg-red-100 font-medium whitespace-nowrap"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
              <table className={reviewTableClass}>
                <colgroup>
                  <col className="w-[20%]" />
                  <col className="w-[8%]" />
                  <col className="w-[8%]" />
                  <col className="w-[64%]" />
                </colgroup>
                <thead className="bg-gray-200">
                  <tr>
                    <th className={reviewThLeftClass}>월간태그명</th>
                    <th className={reviewThClass}>투입시간</th>
                    <th className={reviewThClass}>투입률(%)</th>
                    <th className={`${reviewThLeftClass} !border-r-0`}>AI 요약</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-300">
                  {rTags.length === 0 ? (
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-400 border-r border-gray-300">—</td>
                      <td className="px-4 py-3 text-sm text-gray-400 border-r border-gray-300">—</td>
                      <td className="px-4 py-3 text-sm text-gray-400 border-r border-gray-300">—</td>
                      <td className="px-4 py-3 text-sm text-gray-400">—</td>
                    </tr>
                  ) : (
                    rTags.map((rt) => {
                      const tagRate = totalTagHours > 0 ? Math.round((rt.workHours / totalTagHours) * 100) : 0
                      // rt.tagId = 월간 태그, d.tagId = 주간 태그 → parentTagId로 매칭
                      const tagDetails = details.filter((d) => {
                        const dTag = tags.find((t) => t.tagId === d.tagId)
                        const monthlyId = dTag?.parentTagId ?? d.tagId
                        return monthlyId === rt.tagId || d.tagId === rt.tagId
                      })
                      const tagName = getTagName(rt.tagId)

                      return (
                        <tr key={`${report.reportId}-${rt.reportDetailTagId}`}>
                          <td className="px-4 py-3 text-sm border-r border-gray-300">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{tagName}</span>
                              <button
                                type="button"
                                onClick={() => setReviewDetailModal({ tagName, details: tagDetails, totalHours: rt.workHours })}
                                className="px-2 py-0.5 rounded border border-blue-200 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100"
                              >
                                상세보기
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-700 align-middle border-r border-gray-300">{rt.workHours}h</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-700 align-middle border-r border-gray-300">{tagRate}%</td>
                          <td className="px-4 py-3 text-sm text-gray-600 align-middle">
                            {editingReviewTagAi?.tagId === rt.reportDetailTagId ? (
                              <div className="flex flex-col gap-1">
                                <textarea
                                  value={editingReviewTagAi.value}
                                  onChange={(e) => setEditingReviewTagAi({ ...editingReviewTagAi, value: e.target.value })}
                                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm resize-none"
                                  rows={3}
                                />
                                <div className="flex gap-1 justify-end">
                                  <button type="button" onClick={() => setEditingReviewTagAi(null)} className="px-2 py-0.5 rounded border border-gray-300 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100">취소</button>
                                  <button type="button" onClick={() => { onReviewTagAiSummaryEdit?.(rt, editingReviewTagAi.value); setEditingReviewTagAi(null) }} className="px-2 py-0.5 rounded border border-blue-400 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100">저장</button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start gap-1">
                                <span className="whitespace-pre-line flex-1">{rt.aiSummary || '—'}</span>
                                {onReviewTagAiSummaryEdit && (
                                  <button
                                    type="button"
                                    onClick={() => setEditingReviewTagAi({ tagId: rt.reportDetailTagId, value: rt.aiSummary || '' })}
                                    className="shrink-0 px-2 py-0.5 rounded border border-gray-300 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100"
                                  >수정</button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )
        })}
        <ReviewDetailModal
          isOpen={reviewDetailModal !== null}
          onClose={() => setReviewDetailModal(null)}
          tagName={reviewDetailModal?.tagName ?? ''}
          details={reviewDetailModal?.details ?? []}
          totalHours={reviewDetailModal?.totalHours ?? 0}
        />
      </div>
    )
  }

  const thClass = 'px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase border-r border-gray-300 whitespace-nowrap tracking-wide'
  const thLeftClass = 'px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase border-r border-gray-300 whitespace-nowrap tracking-wide'
  const tableClass = `min-w-full divide-y divide-gray-300 select-none border border-gray-300 table-fixed`

  const hasRowActions = !!(onView || onPeerReport || onTomorrow)

  const renderHead = () => (
    <thead className="bg-gray-200">
      <tr>
        <th className={thClass}>{type === 'daily' ? '주간 태그' : '월간 태그'}</th>
        <th className={thLeftClass}>업무명</th>
        {!hidePerformance && <th className={thClass}>업무 성과</th>}
        <th className={thClass}>투입률</th>
        {showAiSummary && <th className={thLeftClass}>{aiSummaryLabel || 'AI 요약'}</th>}
        <th className={showAiSummary ? thClass : thLeftClass}>한 일</th>
        {showTomorrowPlan && <th className={thLeftClass}>내일 할 일</th>}
        {hasRowActions && <th className="px-4 py-3"></th>}
      </tr>
    </thead>
  )

  const renderColgroup = () => {
    const cols: string[] = []
    if (type === 'daily' && !hidePerformance && !showTomorrowPlan) {
      // 마이페이지 일간: 태그11 업무명24 성과8 투입률6 한일38 액션13
      return (
        <colgroup>
          <col className="w-[11%]" />
          <col className="w-[24%]" />
          <col className="w-[8%]" />
          <col className="w-[6%]" />
          <col className="w-[38%]" />
          <col className="w-[13%]" />
        </colgroup>
      )
    }
    if (type === 'daily' && hidePerformance && showTomorrowPlan) {
      // 팀공유 일간: 태그11 업무명22 투입률6 한일31 내일할일30
      return (
        <colgroup>
          <col className="w-[11%]" />
          <col className="w-[22%]" />
          <col className="w-[6%]" />
          <col className="w-[31%]" />
          <col className="w-[30%]" />
        </colgroup>
      )
    }
    // 주간/월간
    cols.push('w-[11%]') // 태그
    cols.push(hidePerformance ? 'w-[22%]' : 'w-[20%]') // 업무명
    if (!hidePerformance) cols.push('w-[8%]') // 업무성과
    cols.push('w-[6%]') // 투입률
    if (showAiSummary) cols.push(hidePerformance ? 'w-[41%]' : 'w-[35%]') // AI 요약
    cols.push('w-[20%]') // 한 일
    if (hasRowActions) cols.push('w-[10%]')
    return (
      <colgroup>
        {cols.map((w, i) => <col key={i} className={w} />)}
      </colgroup>
    )
  }

  return (
    <div className="overflow-x-auto space-y-5">
      {sorted.map((report) => {
        const details = getDetails(report.reportId)
        const totalHours = sumWorkHours(details)
        const tagGroups = groupDetailsByTag(details)
        const totalRowCount = Math.max(1, details.length)

        return (
          <div key={report.reportId}>
            {memberName && (
              <div className="text-sm font-semibold text-gray-700 mb-0.5">{memberName}</div>
            )}
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {type === 'daily'
                    ? `${report.staDate} (투입 시간 : ${totalHours}h)`
                    : `${report.staDate} ~ ${report.endDate} (투입 시간 : ${totalHours}h)`}
                </h3>
                {type === 'weekly' && !hidePerformance && (
                  <p className="text-xs font-bold text-red-500 mt-0.5">
                    ※ 월간 보고 생성 타겟에 해당하는 주차들에 중복 업무가 발생할 시 업무별 AI 요약을 합쳐서 다시 AI 재요약됩니다. 월간 업무 AI 요약 수정이 필요하면 주간 AI 요약 내용을 수정해 주세요.
                  </p>
                )}
                {type === 'monthly' && !hidePerformance && (
                  <>
                    <p className="text-xs font-bold text-red-500 mt-0.5">
                      ※ 업무 성과가 존재하는 경우에만 성과 보고에서 AI 요약이 만들어집니다. 해당 업무를 성과로 반영하고 싶은 경우 성과 입력을 부탁드립니다.
                    </p>
                    <p className="text-xs font-bold text-red-500 mt-0.5">
                      ※ 성과보고 AI 요약 시 context : 월간 태그 내의 모든 월간 AI 요약 및 업무 성과를 합하여 context로 사용합니다.
                    </p>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                {type === 'monthly' && (
                  <button
                    type="button"
                    onClick={() => alert('프로토타입에서는 GRM 조회를 제공하지 않습니다.')}
                    className="px-3 py-1.5 rounded border border-gray-400 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 font-medium whitespace-nowrap"
                  >
                    GRM 조회
                  </button>
                )}
                {onEdit && type !== 'daily' && (
                  <button
                    type="button"
                    onClick={() => onEdit(report)}
                    className="px-3 py-1.5 rounded border border-blue-400 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 font-medium whitespace-nowrap"
                  >
                    수정
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(report)}
                    className="px-3 py-1.5 rounded border border-red-400 text-sm text-red-700 bg-red-50 hover:bg-red-100 font-medium whitespace-nowrap"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
            <table className={tableClass}>
              {renderColgroup()}
              {renderHead()}
              <tbody className="bg-white divide-y divide-gray-300">
                {details.length === 0 ? (
                  <tr
                    className={onReportClick ? 'hover:bg-blue-50 cursor-pointer' : ''}
                    onClick={onReportClick ? () => onReportClick(report) : undefined}
                  >
                    <td className="px-4 py-3 text-sm text-gray-400 border-r border-gray-300">—</td>
                    <td className="px-4 py-3 text-sm text-gray-400 border-r border-gray-300">—</td>
                    {!hidePerformance && <td className="px-4 py-3 text-sm text-gray-400 border-r border-gray-300">—</td>}
                    <td className="px-4 py-3 text-sm text-gray-400 border-r border-gray-300">—</td>
                    {showAiSummary && <td className="px-4 py-3 text-sm text-gray-400 border-r border-gray-300">—</td>}
                    <td className="px-4 py-3 text-sm text-gray-400 border-r border-gray-300">—</td>
                    {showTomorrowPlan && <td className="px-4 py-3 text-sm text-gray-400">—</td>}
                    {hasRowActions && (
                      <td className="px-3 py-2 align-middle">
                        <div className="flex flex-col gap-2.5">
                          {onView && (
                            <button type="button" onClick={(e) => { e.stopPropagation(); onView(report) }} className="w-full px-3 py-1.5 rounded border border-gray-400 text-sm text-gray-700 bg-white hover:bg-gray-100 font-medium whitespace-nowrap">업무 상세 보기</button>
                          )}
                          {onEdit && (
                            <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(report) }} className="w-full px-3 py-1.5 rounded border border-blue-400 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 font-medium whitespace-nowrap">수정</button>
                          )}
                          {onPeerReport && (
                            <button type="button" onClick={(e) => { e.stopPropagation(); onPeerReport(report) }} className="w-full px-3 py-1.5 rounded border border-purple-400 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 font-medium whitespace-nowrap">동료 협업 기록</button>
                          )}
                          {onTomorrow && (
                            <button type="button" onClick={(e) => { e.stopPropagation(); onTomorrow(report) }} className="w-full px-3 py-1.5 rounded border border-green-400 text-sm text-green-700 bg-green-50 hover:bg-green-100 font-medium whitespace-nowrap">내일 할 일</button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ) : (
                  (() => {
                    let globalIdx = 0
                    return tagGroups.flatMap((group) =>
                      group.details.map((d, detailIdx) => {
                        const isFirstInGroup = detailIdx === 0
                        const currentGlobalIdx = globalIdx
                        globalIdx++
                        return (
                          <tr
                            key={`${report.reportId}-${d.reportDetailId}`}
                            className={onReportClick ? 'hover:bg-blue-50 cursor-pointer' : ''}
                            onClick={onReportClick ? () => onReportClick(report) : undefined}
                          >
                            {isFirstInGroup && (
                              <td
                                rowSpan={group.details.length}
                                className="px-4 py-3 text-sm align-middle text-center border-r border-gray-300 bg-gray-50"
                              >
                                <div className="font-semibold text-gray-800">{group.tagName}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {group.totalHours}h ({calcWorkRate(group.totalHours, totalHours)}%)
                                </div>
                              </td>
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
                            {!hidePerformance && (
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
                            )}
                            <td className="px-4 py-3 text-sm align-middle text-center border-r border-gray-300">
                              <span className="text-gray-700">{d.workHours}h</span>
                              <span className="text-gray-400 ml-1">({calcWorkRate(d.workHours, totalHours)}%)</span>
                            </td>
                            {showAiSummary && (
                              <td className="px-4 py-3 text-sm text-gray-600 align-middle border-r border-gray-300">
                                {editingAiSummary?.detailId === d.reportDetailId ? (
                                  <div className="flex flex-col gap-1">
                                    <textarea
                                      value={editingAiSummary.value}
                                      onChange={(e) => setEditingAiSummary({ ...editingAiSummary, value: e.target.value })}
                                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm resize-none"
                                      rows={3}
                                    />
                                    <div className="flex gap-1 justify-end">
                                      <button type="button" onClick={() => setEditingAiSummary(null)} className="px-2 py-0.5 rounded border border-gray-300 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100">취소</button>
                                      <button type="button" onClick={() => { onAiSummaryEdit?.(d, editingAiSummary.value); setEditingAiSummary(null) }} className="px-2 py-0.5 rounded border border-blue-400 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100">저장</button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-start gap-1">
                                    <span className="whitespace-pre-line flex-1">{d.aiSummary || <span className="text-gray-400">프로토타입에서는 지원하지 않습니다</span>}</span>
                                    {onAiSummaryEdit && (
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setEditingAiSummary({ detailId: d.reportDetailId, value: d.aiSummary || '' }) }}
                                        className="shrink-0 px-2 py-0.5 rounded border border-gray-300 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100"
                                      >수정</button>
                                    )}
                                  </div>
                                )}
                              </td>
                            )}
                            <td className={`px-4 py-3 text-sm align-middle text-gray-700 border-r border-gray-300${showAiSummary ? ' text-center' : ''}`}>
                              {showAiSummary ? (
                                expandedDone.has(d.reportDetailId) ? (
                                  <div className="text-left">
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); setExpandedDone((prev) => { const next = new Set(prev); next.delete(d.reportDetailId); return next }) }}
                                      className="mb-1 px-2 py-0.5 rounded border border-gray-300 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100"
                                    >접기</button>
                                    <div className="whitespace-pre-line">{d.done || '—'}</div>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setExpandedDone((prev) => new Set(prev).add(d.reportDetailId)) }}
                                    className="px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 font-medium whitespace-nowrap"
                                  >한 일 보기</button>
                                )
                              ) : (
                                <span className="whitespace-pre-line">{d.done || '—'}</span>
                              )}
                            </td>
                            {showTomorrowPlan && currentGlobalIdx === 0 && (
                              <td rowSpan={totalRowCount} className="px-4 py-3 text-sm align-top text-gray-700 whitespace-pre-line border-r border-gray-300">
                                {report.tomorrowPlan || ''}
                              </td>
                            )}
                            {hasRowActions && currentGlobalIdx === 0 && (
                              <td rowSpan={totalRowCount} className="px-3 py-2 align-middle">
                                <div className="flex flex-col gap-2.5">
                                  {onView && (
                                    <button type="button" onClick={(e) => { e.stopPropagation(); onView(report) }} className="w-full px-3 py-1.5 rounded border border-gray-400 text-sm text-gray-700 bg-white hover:bg-gray-100 font-medium whitespace-nowrap">업무 상세 보기</button>
                                  )}
                                  {onEdit && (
                                    <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(report) }} className="w-full px-3 py-1.5 rounded border border-blue-400 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 font-medium whitespace-nowrap">수정</button>
                                  )}
                                  {onPeerReport && (
                                    <button type="button" onClick={(e) => { e.stopPropagation(); onPeerReport(report) }} className="w-full px-3 py-1.5 rounded border border-purple-400 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 font-medium whitespace-nowrap">동료 협업 기록</button>
                                  )}
                                  {onTomorrow && (
                                    <button type="button" onClick={(e) => { e.stopPropagation(); onTomorrow(report) }} className="w-full px-3 py-1.5 rounded border border-green-400 text-sm text-green-700 bg-green-50 hover:bg-green-100 font-medium whitespace-nowrap">내일 할 일</button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        )
                      })
                    )
                  })()
                )}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}
