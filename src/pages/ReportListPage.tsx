import { useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { useMockData } from '@/hooks/useMockData'
import { ReportTable } from '@/components/ReportTable'
import { ReviewCreateModal } from '@/components/ReviewCreateModal'
import type { Report } from '@/types'
import type { ReportType } from '@/types'

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
    detailsByReportId,
    reportTagsByReportId,
    setReports,
    setReportDetails,
    setReportTags,
    currentMemberId,
  } = useMockData()

  const [reviewModalOpen, setReviewModalOpen] = useState(false)

  const reportType = (type ?? 'daily') as ReportType
  const reports = myReports.filter((r) => r.type === reportType)

  const getDetails = (reportId: number) => detailsByReportId[reportId] ?? []
  const getReportTags = (reportId: number) => reportTagsByReportId[reportId] ?? []

  const showAiSummary = reportType === 'monthly' || reportType === 'review'

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

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="h-14 bg-white border-b px-6 flex items-center justify-between">
        <h1 className="font-semibold text-gray-900">
          {reportType === 'daily' && '데일리 보고'}
          {reportType === 'weekly' && '주간 보고'}
          {reportType === 'monthly' && '월간 보고'}
          {reportType === 'review' && '성과 보고'}
        </h1>
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
            onEdit={() => {}}
            onDelete={handleDelete}
            type={reportType}
          />
        </div>
      </div>
      <ReviewCreateModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onCreate={handleCreateReview}
        existingRanges={existingReviewRanges}
      />
    </div>
  )
}
