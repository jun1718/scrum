import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMockData } from '@/hooks/useMockData'

export function TeamAssignPage() {
  const navigate = useNavigate()
  const { teams, members, currentMemberId, currentTeamId, setCurrentTeamId, setMembers } = useMockData()
  const [search, setSearch] = useState('')

  const currentMember = currentMemberId != null
    ? members.find((m) => m.memberId === currentMemberId) ?? null
    : null
  const assignedTeam = currentTeamId ? teams.find((t) => t.teamId === currentTeamId) : null

  const filteredTeams = useMemo(() => {
    if (!search.trim()) return teams
    const q = search.trim().toLowerCase()
    return teams.filter((t) => t.teamName.toLowerCase().includes(q))
  }, [teams, search])

  const handleSelect = (teamId: number) => {
    // 이미 다른 팀에 등록된 경우 에러
    if (currentMember?.teamId != null && currentMember.teamId !== teamId) {
      alert('현재 스프린톤에서는 다중 팀 미지원. 추후 개선 예정입니다.')
      return
    }
    setCurrentTeamId(teamId)
    if (currentMemberId != null) {
      setMembers(
        members.map((m) =>
          m.memberId === currentMemberId ? { ...m, teamId: teamId } : m
        )
      )
    }
    navigate('/')
  }

  // 이미 팀이 등록된 경우
  if (assignedTeam) {
    return (
      <div className="bg-gray-50 min-h-full">
        <header className="h-14 bg-white border-b px-6 flex items-center">
          <h1 className="font-semibold text-gray-900">등록된 팀</h1>
        </header>
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-md">
            <p className="text-sm text-gray-500 mb-1">현재 등록된 팀</p>
            <p className="text-lg font-medium text-gray-900">{assignedTeam.teamName}</p>
            <p className="text-xs text-gray-400 mt-2">현재 스프린톤에서는 다중 팀 미지원. 추후 개선 예정</p>
          </div>
        </div>
      </div>
    )
  }

  // 팀 미등록: 팀 선택 UI
  return (
    <div className="bg-gray-50 min-h-full">
      <header className="h-14 bg-white border-b px-6 flex items-center">
        <h1 className="font-semibold text-gray-900">팀 등록</h1>
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
          {teams.length === 0 ? (
            <p className="py-4 text-gray-500 text-sm">등록된 팀이 없습니다. 먼저 팀을 생성해주세요.</p>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  )
}
