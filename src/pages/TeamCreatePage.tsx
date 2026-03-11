import { useState } from 'react'
import { useMockData } from '@/hooks/useMockData'

/**
 * 팀 생성하기 — 별도 메뉴. 1인당 1팀만 생성 가능.
 * 이미 생성한 팀이 있으면 "이미 지정된 팀이 있습니다" + 팀명만 표시.
 */
export function TeamCreatePage() {
  const {
    teams,
    setTeams,
    currentMemberId,
    currentTeamId,
    setCurrentTeamId,
    members,
    setMembers,
  } = useMockData()
  const [teamName, setTeamName] = useState('')
  const [error, setError] = useState('')

  const myCreatedTeam = teams.find((t) => t.createdMemberId === currentMemberId)

  const handleDelete = () => {
    if (!myCreatedTeam) return
    if (!confirm('현재 팀을 삭제하시겠습니까? 해당 팀에 속한 멤버의 팀 지정도 해제됩니다.')) return
    const teamId = myCreatedTeam.teamId
    setTeams(teams.filter((t) => t.teamId !== teamId))
    setMembers(
      members.map((m) => (m.teamId === teamId ? { ...m, teamId: null } : m))
    )
    if (currentTeamId === teamId) {
      setCurrentTeamId(null)
    }
  }

  const handleCreate = () => {
    setError('')
    if (myCreatedTeam) {
      return
    }
    const name = teamName.trim()
    if (!name) {
      setError('팀명을 입력하세요.')
      return
    }
    const newId = Math.max(0, ...teams.map((t) => t.teamId)) + 1
    setTeams([
      ...teams,
      {
        teamId: newId,
        teamName: name,
        weekStartDay: null,
        weekEndDay: null,
        createdAt: new Date().toISOString(),
        createdMemberId: currentMemberId,
      },
    ])
    setTeamName('')
  }

  if (myCreatedTeam) {
    return (
      <div className="bg-gray-50 min-h-full">
        <header className="h-14 bg-white border-b px-6 flex items-center">
          <h1 className="font-semibold text-gray-900">팀 생성하기</h1>
        </header>
        <div className="p-6 max-w-md">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">이미 지정된 팀이 있습니다.</p>
            <p className="text-lg font-medium text-gray-900">
              {myCreatedTeam.teamName}
            </p>
            <p className="text-xs text-gray-400 mt-3">
              1인당 1팀만 생성 가능합니다.
            </p>
            <button
              type="button"
              onClick={handleDelete}
              className="mt-4 px-4 py-2 border border-red-500 text-red-600 rounded-md text-sm hover:bg-red-50"
            >
              팀 삭제
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="h-14 bg-white border-b px-6 flex items-center">
        <h1 className="font-semibold text-gray-900">팀 생성하기</h1>
      </header>
      <div className="p-6 max-w-md">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-3">새 팀을 만듭니다. (1인 1팀 — 속할 팀은 팀 지정하기에서 선택하세요.)</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">팀명</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="팀명 입력"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="button"
              onClick={handleCreate}
              className="px-4 py-2 bg-[#1e40af] text-white rounded-md text-sm hover:bg-[#1d3a9a]"
            >
              팀 생성
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
