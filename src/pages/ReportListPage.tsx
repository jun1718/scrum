import { useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { useMockData } from '@/hooks/useMockData'
import { ReportTable } from '@/components/ReportTable'
import { ReviewCreateModal } from '@/components/ReviewCreateModal'
import type { PeerReport, Report, ReportDetail, ReportType } from '@/types'

const REPORT_TABS: { to: string; label: string; type: ReportType }[] = [
  { to: '/', label: '데일리 슈크럼 작성', type: 'daily' },
  { to: '/reports/daily', label: '데일리 보고', type: 'daily' },
  { to: '/reports/weekly', label: '주간 보고', type: 'weekly' },
  { to: '/reports/monthly', label: '월간 보고', type: 'monthly' },
  { to: '/reports/review', label: '성과 보고', type: 'review' },
]

export function ReportListPage() {
  const { type } = useParams<{ type: string }>()
  const {
    reports: allReports,
    myReports,
    members,
    detailsByReportId,
    reportTagsByReportId,
    peerReportsByReportId,
    setReports,
    setReportDetails,
    setReportTags,
    currentMemberId: rawMemberId,
  } = useMockData()

  const currentMemberId = rawMemberId!

  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [detailReport, setDetailReport] = useState<Report | null>(null)
  const [viewReport, setViewReport] = useState<Report | null>(null)

  const reportType = (type ?? 'daily') as ReportType
  const reports = myReports.filter((r) => r.type === reportType)

  const getDetails = (reportId: number) => detailsByReportId[reportId] ?? []
  const getReportTags = (reportId: number) => reportTagsByReportId[reportId] ?? []

  const showAiSummary = reportType === 'monthly' || reportType === 'review'

  const openDetail = (report: Report) => {
    if (report.type !== 'daily') return
    setDetailReport(report)
  }

  const closeDetail = () => setDetailReport(null)

  const openView = (report: Report) => {
    if (report.type !== 'daily') return
    setViewReport(report)
  }

  const closeView = () => setViewReport(null)

  const detailPeers: PeerReport[] =
    detailReport && peerReportsByReportId[detailReport.reportId]
      ? peerReportsByReportId[detailReport.reportId]
      : []
  const detailPerf: ReportDetail[] =
    detailReport && detailsByReportId[detailReport.reportId]
      ? detailsByReportId[detailReport.reportId].filter((d) => d.performance && d.performance.trim() !== '')
      : []

  const handleDelete = (report: Report) => {
    if (!confirm('삭제하시겠습니까?')) return
    setReports(allReports.filter((r) => r.reportId !== report.reportId))
    setReportDetails((prev) => prev.filter((d) => d.reportId !== report.reportId))
    setReportTags((prev) => prev.filter((rt) => rt.reportId !== report.reportId))
  }

  const handleCreateReview = (staDate: string, endDate: string) => {
    const newId = Math.max(0, ...allReports.map((r) => r.reportId)) + 1
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
    setReportTags((prev) => {
      const nextId = Math.max(0, ...prev.map((rt) => rt.reportTagId)) + 1
      return [
        ...prev,
        {
          reportTagId: nextId,
        reportId: newId,
        tagId: 1,
        workHours: 0,
        type: 'review',
        aiSummaryContent: '성과 보고 AI 요약 (mock)',
        createdAt: new Date().toISOString(),
        createdMemberId: currentMemberId,
        },
      ]
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
    const newId = Math.max(0, ...allReports.map((r) => r.reportId)) + 1
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
  }

  const handleCreateMonthly = () => {
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
    const newId = Math.max(0, ...allReports.map((r) => r.reportId)) + 1
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
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="h-14 bg-white border-b px-6 flex items-center justify-between">
        <h1 className="font-semibold text-gray-900">
          {reportType === 'daily' && '데일리 보고'}
          {reportType === 'weekly' && '주간 보고'}
          {reportType === 'monthly' && '월간 보고'}
          {reportType === 'review' && '성과 보고'}
        </h1>
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
            getReportTags={getReportTags}
            showAiSummary={showAiSummary}
            onEdit={reportType === 'daily' ? openDetail : undefined}
            onDelete={handleDelete}
            type={reportType}
            onReportClick={reportType === 'daily' ? openDetail : undefined}
            onView={reportType === 'daily' ? openView : undefined}
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
                데일리 슈크럼 (조회용)&nbsp;
                <span className="text-sm text-gray-500">
                  {viewReport.staDate} ~ {viewReport.endDate}
                </span>
              </h2>
              <button
                type="button"
                onClick={closeView}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-b">
              <p className="text-sm text-gray-600">
                데일리 슈크럼 작성 탭과 동일한 레이아웃으로,{' '}
                <span className="font-medium">읽기 전용</span>으로만 확인할 수 있습니다.
              </p>
            </div>
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              {(detailsByReportId[viewReport.reportId] ?? []).map((d) => (
                <div
                  key={d.reportDetailId}
                  className="bg-white rounded-lg border border-gray-200 p-4 mb-3"
                >
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div>
                      <p className="block text-xs text-gray-500 mb-1">업무 제목</p>
                      <p className="text-sm text-gray-900">
                        {d.taskTitle || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="block text-xs text-gray-500 mb-1">업무 링크</p>
                      {d.taskLink ? (
                        <a
                          href={d.taskLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block truncate text-sm text-blue-600 hover:underline"
                        >
                          {d.taskLink}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-400">—</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="block text-xs text-gray-500 mb-1">
                      해당 업무로 한 일
                    </p>
                    <p className="text-sm text-gray-800 whitespace-pre-line bg-gray-50 rounded-md px-3 py-2 border border-gray-200">
                      {d.done || '—'}
                    </p>
                  </div>
                  <div className="mt-3 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                    <div>
                      <p className="block text-xs text-gray-500 mb-1">투입시간</p>
                      <p className="text-sm text-gray-900">
                        {d.workHours}h
                      </p>
                    </div>
                    <div>
                      <p className="block text-xs text-gray-500 mb-1">
                        주간 보고 태그
                      </p>
                      <p className="text-sm text-gray-900">#{d.tagId}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="block text-xs text-gray-500 mb-1">
                        어필할 성과
                      </p>
                      <p className="text-sm text-gray-800 whitespace-pre-line bg-gray-50 rounded-md px-3 py-2 border border-gray-200">
                        {d.performance || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
      {detailReport && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="font-semibold text-lg">
                데일리 보고 상세 ({detailReport.staDate} ~ {detailReport.endDate})
              </h2>
              <button
                type="button"
                onClick={closeDetail}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4 max-h-96 overflow-y-auto space-y-6">
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  어필할 성과
                </h3>
                {detailPerf.length === 0 ? (
                  <p className="text-sm text-gray-400">어필한 성과가 없습니다.</p>
                ) : (
                  <ul className="space-y-2">
                    {detailPerf.map((d) => (
                      <li
                        key={d.reportDetailId}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <p className="text-xs text-gray-500 mb-1">
                          {d.taskTitle}
                        </p>
                        <p className="text-sm text-gray-800 whitespace-pre-line">
                          {d.performance}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  동료 협업 기록
                </h3>
                {detailPeers.length === 0 ? (
                  <p className="text-sm text-gray-400">동료 협업 기록이 없습니다.</p>
                ) : (
                  <ul className="space-y-2">
                    {detailPeers.map((pr) => {
                      const peer = members.find(
                        (m) => m.memberId === pr.peerMemberId
                      )
                      return (
                        <li
                          key={pr.peerReportId}
                          className="border border-gray-200 rounded-lg p-3"
                        >
                          <p className="text-xs font-medium text-gray-700 mb-1">
                            {peer?.memberName ?? pr.peerMemberId}
                          </p>
                          <p className="text-sm text-gray-800 whitespace-pre-line">
                            {pr.content ?? '—'}
                          </p>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              <button
                type="button"
                onClick={closeDetail}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
