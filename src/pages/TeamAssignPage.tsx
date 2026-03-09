import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useMockData } from '@/hooks/useMockData'

export function TeamAssignPage() {
  const navigate = useNavigate()
  const { teams, members, currentMemberId, currentTeamId, setCurrentTeamId, setMembers } = useMockData()
  const [search, setSearch] = useState('')

  const assignedTeam = currentTeamId ? teams.find((t) => t.teamId === currentTeamId) : null

  const filteredTeams = useMemo(() => {
    if (!search.trim()) return teams
    const q = search.trim().toLowerCase()
    return teams.filter((t) => t.teamName.toLowerCase().includes(q))
  }, [teams, search])

  const handleSelect = (teamId: number) => {
    setCurrentTeamId(teamId)
    setMembers(
      members.map((m) =>
        m.memberId === currentMemberId ? { ...m, teamId: teamId } : m
      )
    )
    navigate('/')
  }

  // 이미 팀이 지정된 경우: 지정된 팀만 보여주기
  if (assignedTeam) {
    return (
      <div className="bg-gray-50 min-h-full">
        <header className="h-14 bg-white border-b px-6 flex items-center">
          <h1 className="font-semibold text-gray-900">지정된 팀</h1>
        </header>
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-md">
            <p className="text-sm text-gray-500 mb-1">현재 지정된 팀</p>
            <p className="text-lg font-medium text-gray-900">{assignedTeam.teamName}</p>
            <Link
              to="/team/manage"
              className="inline-block mt-4 text-sm text-[#1e40af] hover:underline"
            >
              시작/종료일자·태그 설정 →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 팀 미지정: 팀 선택 UI
  return (
    <div className="bg-gray-50 min-h-full">
      <header className="h-14 bg-white border-b px-6 flex items-center">
        <h1 className="font-semibold text-gray-900">팀 지정</h1>
      </header>
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-w-2xl">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            팀 이름 검색
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="팀명 입력 (자동 검색)"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <ul className="mt-4 divide-y divide-gray-100">
            {filteredTeams.length === 0 ? (
              <li className="py-4 text-gray-500 text-sm">검색 결과가 없습니다.</li>
            ) : (
              filteredTeams.map((t) => (
                <li key={t.teamId} className="py-3 flex justify-between items-center">
                  <span className="text-sm font-medium">{t.teamName}</span>
                  <button
                    type="button"
                    onClick={() => handleSelect(t.teamId)}
                    className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                  >
                    선택
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
