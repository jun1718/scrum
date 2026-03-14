import { useState, useMemo } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { useMockData } from '@/hooks/useMockData'
import { ReportTable } from '@/components/ReportTable'
import { ReviewCreateModal } from '@/components/ReviewCreateModal'
import { PeerReportModal } from '@/components/PeerReportModal'
import { ScrumRow, type ScrumRowData } from '@/components/ScrumRow'
import type { Report, ReportType } from '@/types'

const REPORT_TABS = [
  { to: '/', label: '데일리 슈크럼 작성' },
  { to: '/reports/daily', label: '일간 보고' },
  { to: '/reports/weekly', label: '주간 보고' },
  { to: '/reports/monthly', label: '월간 보고' },
  { to: '/reports/review', label: '성과 보고' },
]

export function ReportListPage() {
  const { type } = useParams<{ type: string }>()
  const {
    reports: allReports,
    myReports,
    members,
    detailsByReportId,
    reportDetailTagsByReportId,
    setReports,
    reportDetails,
    setReportDetails,
    setReportDetailTags,
    peerReports,
    setPeerReports,
    currentMemberId: rawMemberId,
    weeklyTags,
    tags,
  } = useMockData()

  const getMonthlyTagName = (weeklyTagId: number) => {
    const tag = tags.find((t) => t.tagId === weeklyTagId)
    if (!tag?.parentTagId) return null
    const parent = tags.find((t) => t.tagId === tag.parentTagId)
    return parent?.tagName ?? null
  }

  /** 동일 업무 합치기 (task_id 기준) — 주간/월간/성과 공통 */
  const mergeDetailsByTaskId = (details: import('@/types').ReportDetail[]) => {
    const map = new Map<number, { taskId: number; taskTitle: string; taskLink: string; tagId: number; done: string; workHours: number; performance: string | null; aiSummary: string | null }>()
    for (const d of details) {
      const existing = map.get(d.taskId)
      if (existing) {
        existing.workHours += d.workHours
        existing.done = [existing.done, d.done].filter(Boolean).join('\n\n')
        existing.performance = [existing.performance, d.performance].filter(Boolean).join('\n\n') || null
        existing.aiSummary = [existing.aiSummary, d.aiSummary].filter(Boolean).join('\n\n') || null
        existing.taskTitle = d.taskTitle
        existing.taskLink = d.taskLink
        existing.tagId = d.tagId
      } else {
        map.set(d.taskId, {
          taskId: d.taskId,
          taskTitle: d.taskTitle,
          taskLink: d.taskLink,
          tagId: d.tagId,
          done: d.done,
          workHours: d.workHours,
          performance: d.performance || null,
          aiSummary: d.aiSummary || null,
        })
      }
    }
    return Array.from(map.values())
  }

  const currentMemberId = rawMemberId!

  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [viewReport, setViewReport] = useState<Report | null>(null)
  const [viewEditing, setViewEditing] = useState(false)
  const [viewRows, setViewRows] = useState<ScrumRowData[]>([])
  const [peerModalReport, setPeerModalReport] = useState<Report | null>(null)
  const [tomorrowModalReport, setTomorrowModalReport] = useState<Report | null>(null)
  const [tomorrowDraft, setTomorrowDraft] = useState('')
  const [perfModalDetail, setPerfModalDetail] = useState<{ report: Report; detail: import('@/types').ReportDetail } | null>(null)
  const [perfDraft, setPerfDraft] = useState('')

  const reportType = (type ?? 'daily') as ReportType
  const reports = myReports.filter((r) => r.type === reportType)

  const getDetails = (reportId: number) => detailsByReportId[reportId] ?? []
  const getReportDetailTags = (reportId: number) => reportDetailTagsByReportId[reportId] ?? []

  const showAiSummary = reportType === 'weekly' || reportType === 'monthly' || reportType === 'review'

  const openView = (report: Report) => {
    if (report.type !== 'daily') return
    const details = detailsByReportId[report.reportId] ?? []
    setViewRows(details.map((d) => ({
      taskId: d.taskId,
      taskTitle: d.taskTitle,
      taskLink: d.taskLink,
      done: d.done,
      workHours: d.workHours,
      performance: d.performance ?? '',
      tagId: d.tagId,
    })))
    setViewEditing(false)
    setViewReport(report)
  }

  const closeView = () => {
    setViewReport(null)
    setViewEditing(false)
  }

  const handleViewSave = () => {
    if (!viewReport) return
    const reportId = viewReport.reportId
    let newDetails = reportDetails.filter((d) => d.reportId !== reportId)
    const maxDetailId = Math.max(0, ...reportDetails.map((d) => d.reportDetailId))
    viewRows.forEach((row, i) => {
      if (!row.done.trim() || row.tagId == null) return
      const detailId = maxDetailId + i + 1
      newDetails.push({
        reportDetailId: detailId,
        reportId,
        tagId: row.tagId,
        taskId: row.taskId || detailId,
        taskTitle: row.taskTitle || '직접 입력',
        taskLink: row.taskLink || '#',
        done: row.done,
        workHours: row.workHours,
        performance: row.performance || null,
        createdAt: new Date().toISOString(),
        createdMemberId: currentMemberId,
      })
    })
    setReportDetails(newDetails)
    setViewEditing(false)
  }

  const handleDelete = (report: Report) => {
    if (!confirm('삭제하시겠습니까?')) return
    setReports(allReports.filter((r) => r.reportId !== report.reportId))
    setReportDetails((prev) => prev.filter((d) => d.reportId !== report.reportId))
    setReportDetailTags((prev) => prev.filter((rt) => rt.reportId !== report.reportId))
  }

  const teamMembers = useMemo(
    () => members.filter((m) => m.teamId === members.find((x) => x.memberId === currentMemberId)?.teamId),
    [members, currentMemberId]
  )

  const handlePeerSave = (reportId: number, peerMemberId: number, content: string) => {
    const newId = Math.max(0, ...peerReports.map((p) => p.peerReportId)) + 1
    setPeerReports([
      ...peerReports,
      {
        peerReportId: newId,
        reportId,
        peerMemberId,
        content,
        createdAt: new Date().toISOString(),
        createdMemberId: currentMemberId,
      },
    ])
  }

  const handlePeerUpdate = (peerReportId: number, content: string) => {
    setPeerReports(peerReports.map((p) => (p.peerReportId === peerReportId ? { ...p, content } : p)))
  }

  const handlePeerDelete = (peerReportId: number) => {
    setPeerReports(peerReports.filter((p) => p.peerReportId !== peerReportId))
  }

  const handleCreateReview = (staDate: string, endDate: string) => {
    const monthly = myReports.filter(
      (r) => r.type === 'monthly' && r.staDate >= staDate && r.endDate <= endDate
    )
    if (monthly.length === 0) {
      alert('해당 기간의 월간 보고가 없습니다.')
      return
    }
    const monthlyDetails = monthly.flatMap((r) => detailsByReportId[r.reportId] ?? [])
    const merged = mergeDetailsByTaskId(monthlyDetails)

    const newId = Math.max(0, ...allReports.map((r) => r.reportId)) + 1
    const maxDetailId = Math.max(0, ...reportDetails.map((d) => d.reportDetailId))
    const newDetails = merged.map((m, i) => ({
      reportDetailId: maxDetailId + i + 1,
      reportId: newId,
      tagId: m.tagId,
      taskId: m.taskId,
      taskTitle: m.taskTitle,
      taskLink: m.taskLink,
      done: m.done,
      workHours: m.workHours,
      performance: m.performance,
      aiSummary: m.aiSummary ?? '성과 업무별 AI 요약 (mock)',
      createdAt: new Date().toISOString(),
      createdMemberId: currentMemberId,
    }))

    setReports([
      ...allReports,
      {
        reportId: newId,
        memberId: currentMemberId,
        staDate,
        endDate,
        type: 'review',
        createdAt: new Date().toISOString(),
        createdMemberId: currentMemberId,
      },
    ])
    setReportDetails((prev) => [...prev, ...newDetails])

    // 태그별 공수 합산 + 태그별 AI 요약 → report_detail_tag 생성
    const tagMap = new Map<number, { workHours: number; tasks: typeof newDetails }>()
    for (const d of newDetails) {
      const existing = tagMap.get(d.tagId)
      if (existing) {
        existing.workHours += d.workHours
        existing.tasks.push(d)
      } else {
        tagMap.set(d.tagId, { workHours: d.workHours, tasks: [d] })
      }
    }
    setReportDetailTags((prev) => {
      let nextId = Math.max(0, ...prev.map((rt) => rt.reportDetailTagId)) + 1
      const newTags = Array.from(tagMap.entries()).map(([tagId, { workHours }]) => {
        const tagName = tags.find((t) => t.tagId === tagId)?.tagName ?? `태그#${tagId}`
        return {
          reportDetailTagId: nextId++,
          reportId: newId,
          tagId,
          workHours,
          type: 'review' as const,
          aiSummary: `[${tagName}] 태그별 성과 AI 요약 (mock)`,
          createdAt: new Date().toISOString(),
          createdMemberId: currentMemberId,
        }
      })
      return [...prev, ...newTags]
    })
  }

  const existingReviewRanges = myReports
    .filter((r) => r.type === 'review')
    .map((r) => ({ staDate: r.staDate, endDate: r.endDate }))

  const handleCreateWeekly = () => {
    const daily = myReports.filter((r) => r.type === 'daily')
    if (daily.length === 0) {
      alert('생성할 데일리 보고가 없습니다.')
      return
    }
    const sortedDaily = [...daily].sort(
      (a, b) => new Date(a.staDate).getTime() - new Date(b.staDate).getTime()
    )
    const staDate = sortedDaily[0].staDate
    const endDate = sortedDaily[sortedDaily.length - 1].endDate
    const dailyDetails = daily.flatMap((r) => detailsByReportId[r.reportId] ?? [])
    const merged = mergeDetailsByTaskId(dailyDetails)

    const newId = Math.max(0, ...allReports.map((r) => r.reportId)) + 1
    const maxDetailId = Math.max(0, ...reportDetails.map((d) => d.reportDetailId))
    const newDetails = merged.map((m, i) => ({
      reportDetailId: maxDetailId + i + 1,
      reportId: newId,
      tagId: m.tagId,
      taskId: m.taskId,
      taskTitle: m.taskTitle,
      taskLink: m.taskLink,
      done: m.done,
      workHours: m.workHours,
      performance: m.performance,
      aiSummary: '주간 AI 요약 (mock)',
      createdAt: new Date().toISOString(),
      createdMemberId: currentMemberId,
    }))

    setReports([
      ...allReports,
      {
        reportId: newId,
        memberId: currentMemberId,
        staDate,
        endDate,
        type: 'weekly',
        createdAt: new Date().toISOString(),
        createdMemberId: currentMemberId,
      },
    ])
    setReportDetails((prev) => [...prev, ...newDetails])
  }

  const handleCreateMonthly = () => {
    const weekly = myReports.filter((r) => r.type === 'weekly')
    if (weekly.length === 0) {
      alert('생성할 주간 보고가 없습니다.')
      return
    }
    const sortedWeekly = [...weekly].sort(
      (a, b) => new Date(a.staDate).getTime() - new Date(b.staDate).getTime()
    )
    const staDate = sortedWeekly[0].staDate
    const endDate = sortedWeekly[sortedWeekly.length - 1].endDate
    const weeklyDetails = weekly.flatMap((r) => detailsByReportId[r.reportId] ?? [])
    const merged = mergeDetailsByTaskId(weeklyDetails)

    const newId = Math.max(0, ...allReports.map((r) => r.reportId)) + 1
    const maxDetailId = Math.max(0, ...reportDetails.map((d) => d.reportDetailId))
    const newDetails = merged.map((m, i) => ({
      reportDetailId: maxDetailId + i + 1,
      reportId: newId,
      tagId: m.tagId,
      taskId: m.taskId,
      taskTitle: m.taskTitle,
      taskLink: m.taskLink,
      done: m.done,
      workHours: m.workHours,
      performance: m.performance,
      aiSummary: m.aiSummary ?? '월간 AI 요약 (mock)',
      createdAt: new Date().toISOString(),
      createdMemberId: currentMemberId,
    }))

    setReports([
      ...allReports,
      {
        reportId: newId,
        memberId: currentMemberId,
        staDate,
        endDate,
        type: 'monthly',
        createdAt: new Date().toISOString(),
        createdMemberId: currentMemberId,
      },
    ])
    setReportDetails((prev) => [...prev, ...newDetails])
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="h-14 bg-white border-b px-6 flex items-center justify-between">
        <h1 className="font-semibold text-gray-900">마이페이지</h1>
        {reportType === 'weekly' && (
          <button
            type="button"
            onClick={handleCreateWeekly}
            className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
          >
            주간 보고 생성
          </button>
        )}
        {reportType === 'monthly' && (
          <button
            type="button"
            onClick={handleCreateMonthly}
            className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
          >
            월간 보고 생성
          </button>
        )}
        {reportType === 'review' && (
          <button
            type="button"
            onClick={() => setReviewModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
          >
            성과 생성
          </button>
        )}
      </header>
      <div className="bg-white border-b">
        <nav className="flex gap-0 px-6">
          {REPORT_TABS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }: { isActive: boolean }) =>
                `px-4 py-3 text-sm border-b-2 ${
                  isActive
                    ? 'border-blue-500 text-blue-600 font-medium'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <ReportTable
            reports={reports}
            getDetails={getDetails}
            getReportDetailTags={getReportDetailTags}
            showAiSummary={showAiSummary}
            onDelete={reportType !== 'daily' ? handleDelete : undefined}
            type={reportType}
            onView={reportType === 'daily' ? openView : undefined}
            onPeerReport={reportType === 'daily' ? (report) => setPeerModalReport(report) : undefined}
            onTomorrow={reportType === 'daily' ? (report) => {
              setTomorrowDraft(report.tomorrowPlan ?? '')
              setTomorrowModalReport(report)
            } : undefined}
            onPerformance={reportType === 'daily' ? (report, detail) => {
              setPerfDraft(detail.performance ?? '')
              setPerfModalDetail({ report, detail })
            } : undefined}
            tags={tags}
          />
        </div>
      </div>
      <ReviewCreateModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onCreate={handleCreateReview}
        existingRanges={existingReviewRanges}
      />
      {viewReport && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-16 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="font-semibold text-lg">
                {viewReport.staDate} 데일리 슈크럼
              </h2>
              <div className="flex items-center gap-2">
                {viewEditing ? (
                  <button
                    type="button"
                    onClick={handleViewSave}
                    disabled={!viewRows.some((r) => r.done.trim() !== '' && r.tagId != null)}
                    className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    저장
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setViewEditing(true)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                  >
                    수정
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (!viewReport) return
                    handleDelete(viewReport)
                    closeView()
                  }}
                  className="px-3 py-1.5 border border-red-300 text-red-600 rounded-md text-sm hover:bg-red-50"
                >
                  삭제
                </button>
                <button
                  type="button"
                  onClick={closeView}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              {viewRows.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">작성된 내용이 없습니다.</p>
              ) : (
                viewRows.map((row, i) => (
                  <ScrumRow
                    key={i}
                    row={row}
                    weeklyTags={weeklyTags}
                    onChange={(next) => setViewRows(viewRows.map((r, idx) => (idx === i ? next : r)))}
                    onRemove={() => setViewRows(viewRows.filter((_, idx) => idx !== i))}
                    getMonthlyTagName={getMonthlyTagName}
                    readOnly={!viewEditing}
                  />
                ))
              )}
              {viewEditing && (
                <button
                  type="button"
                  onClick={() => {
                    const nextTaskId = Math.max(0, ...viewRows.map((r) => r.taskId)) + 1
                    setViewRows([...viewRows, { taskId: nextTaskId, taskTitle: '', taskLink: '', done: '', workHours: 0, performance: '', tagId: null }])
                  }}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-400 hover:border-blue-400 hover:text-blue-500 text-sm"
                >
                  + 행 추가
                </button>
              )}
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              <button
                type="button"
                onClick={closeView}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
      {tomorrowModalReport && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-24 z-[60]">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="font-semibold text-lg">내일 할 일</h2>
              <button
                type="button"
                onClick={() => setTomorrowModalReport(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4">
              <textarea
                value={tomorrowDraft}
                onChange={(e) => setTomorrowDraft(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="내일 할 일을 입력하세요"
              />
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTomorrowModalReport(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  const value = tomorrowDraft.trim() || null
                  setReports(allReports.map((r) =>
                    r.reportId === tomorrowModalReport.reportId ? { ...r, tomorrowPlan: value } : r
                  ))
                  if (viewReport && viewReport.reportId === tomorrowModalReport.reportId) {
                    setViewReport({ ...viewReport, tomorrowPlan: value })
                  }
                  setTomorrowModalReport(null)
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
      {perfModalDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-24 z-[60]">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="font-semibold text-lg">해당 업무 성과</h2>
              <button
                type="button"
                onClick={() => setPerfModalDetail(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-500 mb-2">
                업무: <span className="font-medium text-gray-700">{perfModalDetail.detail.taskTitle || '(제목 없음)'}</span>
              </p>
              <textarea
                value={perfDraft}
                onChange={(e) => setPerfDraft(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="이 업무에서 어필할 성과를 입력하세요"
              />
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPerfModalDetail(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  const value = perfDraft.trim() || null
                  setReportDetails((prev) =>
                    prev.map((d) =>
                      d.reportDetailId === perfModalDetail.detail.reportDetailId
                        ? { ...d, performance: value }
                        : d
                    )
                  )
                  setPerfModalDetail(null)
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
      <PeerReportModal
        isOpen={!!peerModalReport}
        onClose={() => setPeerModalReport(null)}
        peerReports={peerReports}
        teamMembers={teamMembers}
        currentMemberId={currentMemberId}
        onSave={handlePeerSave}
        onUpdate={handlePeerUpdate}
        onDelete={handlePeerDelete}
        reportId={peerModalReport?.reportId ?? null}
      />
    </div>
  )
}
