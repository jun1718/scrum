import { useMockData } from '@/hooks/useMockData'
import { useSearchParams } from 'react-router-dom'
import { ReportTable } from '@/components/ReportTable'

type ShareTab = 'daily' | 'weekly' | 'monthly'

const SHARE_TABS: { key: ShareTab; label: string }[] = [
  { key: 'daily', label: '일간 보고' },
  { key: 'weekly', label: '주간 보고' },
  { key: 'monthly', label: '월간 보고' },
]

export function TeamSharePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = (searchParams.get('tab') as ShareTab) || 'daily'
  const setTab = (key: ShareTab) => setSearchParams({ tab: key })

  const {
    reports,
    detailsByReportId,
    members,
    currentTeamId,
    tags,
  } = useMockData()

  const teamMembers = members.filter((m) => m.teamId === currentTeamId)
  const teamReports = reports.filter(
    (r) => r.type === tab && teamMembers.some((m) => m.memberId === r.memberId)
  )

  const getMemberName = (memberId: number) =>
    members.find((m) => m.memberId === memberId)?.memberName ?? '알 수 없음'

  const getDetails = (reportId: number) => detailsByReportId[reportId] ?? []

  const showAiSummary = tab === 'weekly' || tab === 'monthly'

  /* ── 일간: 날짜별 → 멤버별 그룹 ── */
  const dailyByDate = (() => {
    if (tab !== 'daily') return []
    const dateMap = new Map<string, typeof teamReports>()
    for (const r of teamReports) {
      const list = dateMap.get(r.staDate) ?? []
      list.push(r)
      dateMap.set(r.staDate, list)
    }
    return [...dateMap.entries()].sort(([a], [b]) => b.localeCompare(a))
  })()

  /* ── 주간/월간: 멤버별 그룹 ── */
  const reportsByMember = (() => {
    if (tab === 'daily') return []
    return teamMembers.map((m) => ({
      member: m,
      reports: teamReports.filter((r) => r.memberId === m.memberId),
    })).filter((g) => g.reports.length > 0)
  })()

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="h-14 bg-white border-b px-6 flex items-center">
        <h1 className="font-semibold text-gray-900">팀 공유</h1>
      </header>
      <div className="bg-white border-b">
        <nav className="flex gap-0 px-6">
          {SHARE_TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-4 py-3 text-sm border-b-2 ${
                tab === key
                  ? 'border-blue-500 text-blue-600 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-6">
        {teamMembers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12 text-gray-400">
            팀을 등록하면 팀원별 보고를 볼 수 있습니다.
          </div>
        ) : tab === 'daily' ? (
          dailyByDate.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12 text-gray-400">
              아직 보고가 없습니다.
            </div>
          ) : (
            <div className="space-y-6">
              {dailyByDate.map(([date, dateReports]) => (
                <div key={date} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 px-1">{date}</h3>
                  <div className="space-y-4">
                    {dateReports.map((report) => (
                      <ReportTable
                        key={report.reportId}
                        reports={[report]}
                        getDetails={getDetails}
                        type="daily"
                        tags={tags}
                        hidePerformance
                        showTomorrowPlan
                        memberName={getMemberName(report.memberId)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          reportsByMember.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12 text-gray-400">
              아직 보고가 없습니다.
            </div>
          ) : (
            <div className="space-y-6">
              {reportsByMember.map(({ member, reports: memberReports }) => (
                <div key={member.memberId} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-4">
                  <ReportTable
                    reports={memberReports}
                    getDetails={getDetails}
                    type={tab}
                    tags={tags}
                    showAiSummary={showAiSummary}
                    hidePerformance
                    aiSummaryLabel="한 일 요약"
                    memberName={member.memberName}
                  />
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
