import { useState, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { useMockData } from '@/hooks/useMockData'
import { ScrumRow, type ScrumRowData } from '@/components/ScrumRow'
import { PeerReportModal } from '@/components/PeerReportModal'

const REPORT_TABS = [
  { to: '/', label: '데일리 슈크럼 작성', end: true },
  { to: '/reports/daily', label: '데일리 보고' },
  { to: '/reports/weekly', label: '주간 보고' },
  { to: '/reports/monthly', label: '월간 보고' },
  { to: '/reports/review', label: '성과 보고' },
]

export function DailyScrumWritePage() {
  const {
    weeklyTags,
    currentMemberId,
    reports,
    reportDetails,
    peerReports,
    setReports,
    setReportDetails,
    setPeerReports,
    detailsByReportId,
    members,
    tags,
  } = useMockData()

  const today = new Date().toISOString().slice(0, 10)
  const existingDaily = reports.find(
    (r) => r.type === 'daily' && r.memberId === currentMemberId && r.staDate === today
  )
  const existingDetails = existingDaily ? detailsByReportId[existingDaily.reportId] ?? [] : []

  const [rows, setRows] = useState<ScrumRowData[]>(() =>
    existingDetails.length > 0
      ? existingDetails.map((d) => ({
          taskId: d.taskId,
          taskTitle: d.taskTitle,
          taskLink: d.taskLink,
          done: d.done,
          workHours: d.workHours,
          performance: d.performance ?? '',
          tagId: d.tagId,
        }))
      : [
          {
            taskId: 0,
            taskTitle: '',
            taskLink: '',
            done: '',
            workHours: 0,
            performance: '',
            tagId: null,
          },
        ]
  )
  const [peerModalOpen, setPeerModalOpen] = useState(false)

  const getMonthlyTagName = (weeklyTagId: number) => {
    const tag = tags.find((t) => t.tagId === weeklyTagId)
    if (!tag?.parentTagId) return null
    const parent = tags.find((t) => t.tagId === tag.parentTagId)
    return parent?.tagName ?? null
  }

  const teamMembers = useMemo(
    () => members.filter((m) => m.teamId === members.find((x) => x.memberId === currentMemberId)?.teamId),
    [members, currentMemberId]
  )

  const canSave =
    rows.length > 0 &&
    rows.every((r) => r.done.trim() !== '' && r.tagId != null) &&
    rows.some((r) => r.done.trim() !== '')

  const handleSave = () => {
    if (!canSave) return
    const newReportId = existingDaily
      ? existingDaily.reportId
      : Math.max(0, ...reports.map((r) => r.reportId)) + 1

    if (!existingDaily) {
      setReports([
        ...reports,
        {
          reportId: newReportId,
          memberId: currentMemberId,
          staDate: today,
          endDate: today,
          type: 'daily',
          createdAt: new Date().toISOString(),
          createdMemberId: currentMemberId,
        },
      ])
    }

    let newDetails = reportDetails.filter((d) => d.reportId !== newReportId)

    const maxDetailId = Math.max(0, ...reportDetails.map((d) => d.reportDetailId))
    rows.forEach((row, i) => {
      if (!row.done.trim() || row.tagId == null) return
      const detailId = maxDetailId + i + 1
      newDetails.push({
        reportDetailId: detailId,
        reportId: newReportId,
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
    setPeerModalOpen(false)
  }

  const addRow = () => {
    const nextTaskId = Math.max(0, ...rows.map((r) => r.taskId)) + 1
    setRows([
      ...rows,
      {
        taskId: nextTaskId,
        taskTitle: '',
        taskLink: '',
        done: '',
        workHours: 0,
        performance: '',
        tagId: null,
      },
    ])
  }

  const updateRow = (index: number, next: ScrumRowData) => {
    setRows(rows.map((r, i) => (i === index ? next : r)))
  }

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index))
  }

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

  const handlePeerDelete = (peerReportId: number) => {
    setPeerReports(peerReports.filter((p) => p.peerReportId !== peerReportId))
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="h-14 bg-white border-b px-6 flex items-center">
        <h1 className="font-semibold text-gray-900">데일리 슈크럼 작성</h1>
      </header>
      <div className="bg-white border-b">
        <nav className="flex gap-0 px-6">
          {REPORT_TABS.map(({ to, label, end }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          {rows.map((row, i) => (
            <ScrumRow
              key={i}
              row={row}
              weeklyTags={weeklyTags}
              onChange={(next) => updateRow(i, next)}
              onRemove={() => removeRow(i)}
              getMonthlyTagName={getMonthlyTagName}
              readOnlyTaskTitle
            />
          ))}
          <button
            type="button"
            onClick={addRow}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-400 hover:border-blue-400 hover:text-blue-500 text-sm"
          >
            + 행 추가
          </button>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setPeerModalOpen(true)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              동료 협업 기록
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              저장
            </button>
          </div>
        </div>
      </div>
      <PeerReportModal
        isOpen={peerModalOpen}
        onClose={() => setPeerModalOpen(false)}
        peerReports={peerReports}
        teamMembers={teamMembers}
        currentMemberId={currentMemberId}
        onSave={handlePeerSave}
        onDelete={handlePeerDelete}
        reportId={existingDaily?.reportId ?? null}
      />
    </div>
  )
}
