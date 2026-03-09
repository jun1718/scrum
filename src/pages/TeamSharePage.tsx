import { useState } from 'react'
import { useMockData } from '@/hooks/useMockData'
import { calcWorkRate, sumWorkHours } from '@/utils/calc'

const SHARE_TABS = [
  { to: '/team/share', search: '?tab=daily', label: '데일리 보고' },
  { to: '/team/share', search: '?tab=weekly', label: '주간 보고' },
  { to: '/team/share', search: '?tab=monthly', label: '월간 보고' },
]

type ShareTab = 'daily' | 'weekly' | 'monthly'

export function TeamSharePage() {
  const [tab, setTab] = useState<ShareTab>(() => {
    const params = new URLSearchParams(window.location.search)
    return (params.get('tab') as ShareTab) || 'daily'
  })

  const {
    reports,
    reportTagsByReportId,
    detailsByReportId,
    members,
    currentTeamId,
  } = useMockData()

  const teamMembers = members.filter((m) => m.teamId === currentTeamId)
  const teamReports = reports.filter(
    (r) => r.type === tab && teamMembers.some((m) => m.memberId === r.memberId)
  )

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="h-14 bg-white border-b px-6 flex items-center">
        <h1 className="font-semibold text-gray-900">팀 업무 공유</h1>
      </header>
      <div className="bg-white border-b">
        <nav className="flex gap-0 px-6">
          {SHARE_TABS.map(({ search, label }) => {
            const t = search.includes('daily') ? 'daily' : search.includes('weekly') ? 'weekly' : 'monthly'
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-4 py-3 text-sm border-b-2 ${
                  tab === t
                    ? 'border-blue-500 text-blue-600 font-medium'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            )
          })}
        </nav>
      </div>
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {teamMembers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              팀을 지정하면 팀원별 보고를 볼 수 있습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      팀원
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      시작일
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      종료일
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      업무 목록 (투입률 %)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      태그별 투입
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {teamMembers.map((member) => {
                    const memberReports = teamReports.filter((r) => r.memberId === member.memberId)
                    return memberReports.length === 0 ? (
                      <tr key={member.memberId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">{member.memberName}</td>
                        <td colSpan={4} className="px-4 py-3 text-sm text-gray-400">
                          보고 없음
                        </td>
                      </tr>
                    ) : (
                      memberReports.map((report) => {
                        const details = detailsByReportId[report.reportId] ?? []
                        const totalHours = sumWorkHours(details)
                        const reportTags = reportTagsByReportId[report.reportId] ?? []
                        return (
                          <tr key={report.reportId} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium">
                              {member.memberName}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {report.staDate}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {report.endDate}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <ul className="list-disc list-inside space-y-1">
                                {details.map((d) => (
                                  <li key={d.reportDetailId}>
                                    {d.taskTitle} — {d.workHours}h (
                                    {calcWorkRate(d.workHours, totalHours)}%)
                                  </li>
                                ))}
                              </ul>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {reportTags.map((rt) => (
                                <span key={rt.reportTagId} className="mr-2">
                                  {rt.workHours}h
                                </span>
                              ))}
                            </td>
                          </tr>
                        )
                      })
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
