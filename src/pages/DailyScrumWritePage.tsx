import { useState, useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useMockData } from '@/hooks/useMockData'

const REPORT_TABS = [
  { to: '/reports/daily', label: '일간 보고' },
  { to: '/reports/weekly', label: '주간 보고' },
  { to: '/reports/monthly', label: '월간 보고' },
  { to: '/reports/review', label: '성과 보고' },
]
import { ScrumRow, type ScrumRowData } from '@/components/ScrumRow'
import { PeerReportModal } from '@/components/PeerReportModal'
import { ApiSection, type ApiInfo } from '@/components/ApiTag'

const DAILY_SCRUM_APIS: ApiInfo[] = [
  { method: 'GET', endpoint: '/reports/daily?date={date}', description: '해당 일자 데일리 조회' },
  { method: 'POST', endpoint: '/reports/daily', description: '데일리 저장' },
  { method: 'PUT', endpoint: '/reports/daily/{reportId}', description: '데일리 수정' },
]

const DAILY_DETAIL_APIS: ApiInfo[] = [
  { method: 'DELETE', endpoint: '/reports/daily/{reportId}/details/{detailId}', description: '행 삭제' },
]

const PEER_REPORT_APIS: ApiInfo[] = [
  { method: 'GET', endpoint: '/reports/daily/peer-reports?date={date}', description: '동료 협업 조회' },
  { method: 'POST', endpoint: '/reports/daily/peer-reports', description: '동료 협업 저장' },
  { method: 'PUT', endpoint: '/reports/daily/peer-reports/{id}', description: '동료 협업 수정' },
  { method: 'DELETE', endpoint: '/reports/daily/peer-reports/{id}', description: '동료 협업 삭제' },
]

export function DailyScrumWritePage() {
  const navigate = useNavigate()
  const {
    weeklyTags,
    monthlyTags,
    currentMemberId: rawMemberId,
    currentTeam,
    reports,
    reportDetails,
    peerReports,
    setReports,
    setReportDetails,
    setReportTags,
    setPeerReports,
    detailsByReportId,
    members,
    tags,
  } = useMockData()

  const currentMemberId = rawMemberId!

  const hasSchedule = currentTeam?.weekStartDay != null && currentTeam?.weekEndDay != null
  const hasMonthlyTags = monthlyTags.length > 0
  const hasWeeklyTags = weeklyTags.length > 0
  const teamSettingIncomplete = !hasSchedule || !hasMonthlyTags || !hasWeeklyTags

  const today = new Date().toISOString().slice(0, 10)
  const [selectedDate, setSelectedDate] = useState(today)

  const existingDaily = reports.find(
    (r) => r.type === 'daily' && r.memberId === currentMemberId && r.staDate === selectedDate
  )
  const existingDetails = existingDaily ? detailsByReportId[existingDaily.reportId] ?? [] : []

  const emptyRow: ScrumRowData = {
    taskId: 0,
    taskTitle: '',
    taskLink: '',
    done: '',
    workHours: 0,
    performance: '',
    tagId: null,
  }

  const buildRows = (details: typeof existingDetails): ScrumRowData[] =>
    details.length > 0
      ? details.map((d) => ({
          taskId: d.taskId,
          taskTitle: d.taskTitle,
          taskLink: d.taskLink,
          done: d.done,
          workHours: d.workHours,
          performance: d.performance ?? '',
          tagId: d.tagId,
        }))
      : [emptyRow]

  const [rows, setRows] = useState<ScrumRowData[]>(() => buildRows(existingDetails))
  const [tomorrowPlan, setTomorrowPlan] = useState(existingDaily?.tomorrowPlan ?? '')
  const [editing, setEditing] = useState(!existingDaily)
  const [peerModalOpen, setPeerModalOpen] = useState(false)
  const [tomorrowModalOpen, setTomorrowModalOpen] = useState(false)
  const [tomorrowDraft, setTomorrowDraft] = useState('')

  const changeDate = (offset: number) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + offset)
    const newDate = d.toISOString().slice(0, 10)
    setSelectedDate(newDate)
    const dailyForDate = reports.find(
      (r) => r.type === 'daily' && r.memberId === currentMemberId && r.staDate === newDate
    )
    const detailsForDate = dailyForDate ? detailsByReportId[dailyForDate.reportId] ?? [] : []
    setRows(buildRows(detailsForDate))
    setTomorrowPlan(dailyForDate?.tomorrowPlan ?? '')
    setEditing(!dailyForDate)
  }

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
          staDate: selectedDate,
          endDate: selectedDate,
          type: 'daily',
          tomorrowPlan: tomorrowPlan.trim() || null,
          createdAt: new Date().toISOString(),
          createdMemberId: currentMemberId,
        },
      ])
    } else {
      setReports(reports.map((r) =>
        r.reportId === newReportId ? { ...r, tomorrowPlan: tomorrowPlan.trim() || null } : r
      ))
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
    setEditing(false)
  }

  const handleDelete = () => {
    if (!existingDaily) return
    if (!confirm('이 날짜의 데일리 슈크럼을 삭제하시겠습니까?')) return
    const reportId = existingDaily.reportId
    setReports(reports.filter((r) => r.reportId !== reportId))
    setReportDetails(reportDetails.filter((d) => d.reportId !== reportId))
    setReportTags((prev) => prev.filter((rt) => rt.reportId !== reportId))
    setPeerReports(peerReports.filter((p) => p.reportId !== reportId))
    setRows([emptyRow])
    setEditing(true)
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

  const handlePeerUpdate = (peerReportId: number, content: string) => {
    setPeerReports(peerReports.map((p) => (p.peerReportId === peerReportId ? { ...p, content } : p)))
  }

  const handlePeerDelete = (peerReportId: number) => {
    setPeerReports(peerReports.filter((p) => p.peerReportId !== peerReportId))
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="h-14 bg-white border-b px-6 flex items-center">
        <h1 className="font-semibold text-gray-900">마이페이지</h1>
      </header>
      <div className="bg-white border-b">
        <nav className="flex gap-0 px-6">
          {REPORT_TABS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
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

      {teamSettingIncomplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">팀 설정이 필요합니다</h2>
            <p className="text-sm text-gray-600 mb-2">
              데일리 슈크럼을 작성하려면 아래 항목이 모두 설정되어야 합니다.
            </p>
            <ul className="text-sm text-gray-600 mb-4 list-disc pl-5 space-y-1">
              {!hasSchedule && <li>주간 보고 시작/종료 요일</li>}
              {!hasMonthlyTags && <li>월간 태그(ESM명)</li>}
              {!hasWeeklyTags && <li>주간 태그</li>}
            </ul>
            <button
              type="button"
              onClick={() => navigate('/team/manage')}
              className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600"
            >
              팀 정보 세팅하러 가기
            </button>
          </div>
        </div>
      )}

      <div className="p-6 space-y-4">
        <ApiSection label="데일리 슈크럼 조회/저장" apis={DAILY_SCRUM_APIS}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => changeDate(-1)}
                className="p-1 text-gray-400 hover:text-gray-700"
                aria-label="이전 날짜"
              >
                &larr;
              </button>
              <h2 className="text-sm font-medium text-gray-700">
                {selectedDate} 데일리 슈크럼
                {selectedDate === today && <span className="ml-1 text-xs text-blue-500">(오늘)</span>}
              </h2>
              <button
                type="button"
                onClick={() => changeDate(1)}
                disabled={selectedDate >= today}
                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="다음 날짜"
              >
                &rarr;
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setTomorrowDraft(tomorrowPlan)
                  setTomorrowModalOpen(true)
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                내일 할 일
              </button>
              <ApiSection label="동료 협업 CRUD" apis={PEER_REPORT_APIS}>
                <button
                  type="button"
                  onClick={() => setPeerModalOpen(true)}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  동료 협업 기록
                </button>
              </ApiSection>
              {editing ? (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!canSave}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  저장
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  수정
                </button>
              )}
              {existingDaily && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1.5 border border-red-300 text-red-600 rounded-md text-sm hover:bg-red-50"
                >
                  삭제
                </button>
              )}
            </div>
          </div>
          <ApiSection label="업무 행 (reportDetail)" apis={DAILY_DETAIL_APIS}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              {rows.map((row, i) => (
                <ScrumRow
                  key={i}
                  row={row}
                  weeklyTags={weeklyTags}
                  onChange={(next) => updateRow(i, next)}
                  onRemove={() => removeRow(i)}
                  getMonthlyTagName={getMonthlyTagName}
                  readOnly={!editing}
                />
              ))}
              {editing && (
                <button
                  type="button"
                  onClick={addRow}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-400 hover:border-blue-400 hover:text-blue-500 text-sm"
                >
                  + 행 추가
                </button>
              )}
            </div>
          </ApiSection>

        </ApiSection>
      </div>
      {tomorrowModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50" role="dialog" aria-labelledby="tomorrow-modal-title">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 id="tomorrow-modal-title" className="font-semibold text-lg">내일 할 일</h2>
              <button
                type="button"
                onClick={() => setTomorrowModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4">
              <textarea
                value={tomorrowDraft}
                onChange={(e) => setTomorrowDraft(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={5}
                placeholder="내일 할 일을 입력하세요 (선택)"
                autoFocus
              />
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTomorrowModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  const value = tomorrowDraft.trim() || null
                  setTomorrowPlan(tomorrowDraft)
                  if (existingDaily) {
                    setReports(reports.map((r) =>
                      r.reportId === existingDaily.reportId ? { ...r, tomorrowPlan: value } : r
                    ))
                  }
                  setTomorrowModalOpen(false)
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
        isOpen={peerModalOpen}
        onClose={() => setPeerModalOpen(false)}
        peerReports={peerReports}
        teamMembers={teamMembers}
        currentMemberId={currentMemberId}
        onSave={handlePeerSave}
        onUpdate={handlePeerUpdate}
        onDelete={handlePeerDelete}
        reportId={existingDaily?.reportId ?? null}
      />
    </div>
  )
}
