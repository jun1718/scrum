import { useState } from 'react'
import { useMockData } from '@/hooks/useMockData'
import { calcWorkRate, sumWorkHours } from '@/utils/calc'

type ShareTab = 'daily' | 'weekly' | 'monthly'

const SHARE_TABS: { key: ShareTab; label: string }[] = [
  { key: 'daily', label: '일간 보고' },
  { key: 'weekly', label: '주간 보고' },
  { key: 'monthly', label: '월간 보고' },
]

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

  const getMemberName = (memberId: number) =>
    members.find((m) => m.memberId === memberId)?.memberName ?? '알 수 없음'

  /* ── 일간 보고: 날짜별 그룹 ── */
  const dailyByDate = (() => {
    if (tab !== 'daily') return []
    const dateMap = new Map<string, typeof teamReports>()
    for (const r of teamReports) {
      const list = dateMap.get(r.staDate) ?? []
      list.push(r)
      dateMap.set(r.staDate, list)
    }
    return [...dateMap.entries()]
      .sort(([a], [b]) => b.localeCompare(a)) // 최신순
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
          /* ── 일간 보고 탭: 날짜별 → 팀원별 테이블 ── */
          dailyByDate.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12 text-gray-400">
              아직 보고가 없습니다.
            </div>
          ) : (
            <div className="space-y-6">
              {dailyByDate.map(([date, dateReports]) => (
                <div key={date} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b">
                    <h3 className="text-sm font-semibold text-gray-700">{date}</h3>
                  </div>
                  <div className="overflow-x-auto">
                    {(() => {
                      const nextDate = new Date(date)
                      nextDate.setDate(nextDate.getDate() + 1)
                      const nextDateStr = nextDate.toISOString().slice(0, 10)
                      return (
                    <table className="min-w-full table-fixed divide-y divide-gray-200 select-none">
                      <colgroup>
                        <col className="w-[8%]" />
                        <col className="w-[6%]" />
                        <col className="w-[18%]" />
                        <col className="w-[6%]" />
                        <col className="w-[30%]" />
                        <col className="w-[32%]" />
                      </colgroup>
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-300">
                            팀원
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-300 whitespace-nowrap">
                            총 투입
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-300">
                            업무명
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-300 whitespace-nowrap">
                            투입률
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-300">
                            업무 내용
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                            {nextDateStr} 할 일
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {dateReports.map((report) => {
                          const details = detailsByReportId[report.reportId] ?? []
                          const rowCount = Math.max(1, details.length)
                          const memberName = getMemberName(report.memberId)
                          const totalHours = sumWorkHours(details)

                          return details.length === 0 ? (
                            <tr key={report.reportId}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-700 align-middle border-r border-gray-100">
                                {memberName}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-400 align-middle border-r border-gray-100">—</td>
                              <td className="px-4 py-3 text-sm text-gray-400 align-middle border-r border-gray-200">—</td>
                              <td className="px-4 py-3 text-sm text-gray-400 align-middle border-r border-gray-200">—</td>
                              <td className="px-4 py-3 text-sm text-gray-400 align-middle border-r border-gray-200">—</td>
                              <td className="px-4 py-3 text-sm text-gray-400 align-middle"></td>
                            </tr>
                          ) : (
                            details.map((d, idx) => (
                              <tr key={`${report.reportId}-${d.reportDetailId}`}>
                                {idx === 0 && (
                                  <>
                                    <td
                                      rowSpan={rowCount}
                                      className="px-4 py-3 text-sm font-medium text-gray-700 align-middle border-r border-gray-100"
                                    >
                                      {memberName}
                                    </td>
                                    <td
                                      rowSpan={rowCount}
                                      className="px-4 py-3 text-sm text-gray-700 align-middle border-r border-gray-100 text-center font-medium"
                                    >
                                      {totalHours}h
                                    </td>
                                  </>
                                )}
                                <td className="px-4 py-3 text-sm align-middle border-r border-gray-200">
                                  {d.taskLink && d.taskLink !== '#' ? (
                                    <a
                                      href={d.taskLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-medium text-blue-600 hover:underline"
                                    >
                                      {d.taskTitle || '—'}
                                    </a>
                                  ) : (
                                    <span className="font-medium text-gray-900">{d.taskTitle || '—'}</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm align-middle text-center border-r border-gray-200">
                                  <span className="text-gray-700">{d.workHours}h</span>
                                  <span className="text-gray-400 ml-1">({calcWorkRate(d.workHours, totalHours)}%)</span>
                                </td>
                                <td className="px-4 py-3 text-sm align-middle text-gray-700 whitespace-pre-line border-r border-gray-200">
                                  {d.done || '—'}
                                </td>
                                {idx === 0 && (
                                  <td rowSpan={rowCount} className="px-4 py-3 text-sm align-middle text-gray-700 whitespace-pre-line">
                                    {report.tomorrowPlan || ''}
                                  </td>
                                )}
                              </tr>
                            ))
                          )
                        })}
                      </tbody>
                    </table>
                      )
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* ── 주간/월간 보고 탭: 기존 테이블 ── */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                      <tr key={member.memberId}>
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
                          <tr key={report.reportId}>
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
          </div>
        )}
      </div>
    </div>
  )
}
