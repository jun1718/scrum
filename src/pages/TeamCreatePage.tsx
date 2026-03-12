import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMockData } from '@/hooks/useMockData'

/**
 * 팀 생성하기 — 별도 메뉴. 1인당 1팀만 생성 가능.
 * 생성 시 관리자가 됨. 팀원 등록은 관리자만 가능.
 * 이미 생성한 팀이 있으면 "이미 생성된 팀이 있습니다" + 팀명 표시 + 팀원 등록하러가기 버튼.
 */
export function TeamCreatePage() {
  const navigate = useNavigate()
  const {
    teams,
    setTeams,
    currentMemberId: rawMemberId,
    currentTeamId,
    setCurrentTeamId,
    members,
    setMembers,
  } = useMockData()

  const currentMemberId = rawMemberId!

  const [teamName, setTeamName] = useState('')
  const [error, setError] = useState('')
  const [justCreated, setJustCreated] = useState(false)

  const myCreatedTeam = teams.find((t) => t.createdMemberId === currentMemberId)

  const handleDelete = () => {
    if (!myCreatedTeam) return
    if (!confirm('현재 팀을 삭제하시겠습니까? 해당 팀에 속한 멤버의 팀 등록도 해제됩니다.')) return
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
    const newTeam = {
      teamId: newId,
      teamName: name,
      weekStartDay: null,
      weekEndDay: null,
      createdAt: new Date().toISOString(),
      createdMemberId: currentMemberId,
    }
    setTeams([...teams, newTeam])
    // 팀 생성 시 자동으로 본인을 해당 팀에 배정 (관리자)
    setCurrentTeamId(newId)
    setMembers(
      members.map((m) =>
        m.memberId === currentMemberId ? { ...m, teamId: newId, managerYn: 'Y' as const } : m
      )
    )
    setTeamName('')
    setJustCreated(true)
  }

  if (myCreatedTeam) {
    return (
      <div className="bg-gray-50 min-h-full">
        <header className="h-14 bg-white border-b px-6 flex items-center">
          <h1 className="font-semibold text-gray-900">팀 생성하기</h1>
        </header>
        <div className="p-6 max-w-md">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {justCreated ? (
              <p className="text-sm text-green-600 mb-1">팀이 생성되었습니다! 관리자로 지정되었습니다.</p>
            ) : (
              <p className="text-sm text-gray-500 mb-1">이미 생성된 팀이 있습니다.</p>
            )}
            <p className="text-lg font-medium text-gray-900">
              {myCreatedTeam.teamName}
            </p>
            <p className="text-xs text-gray-400 mt-3">
              1인당 1팀만 생성 가능합니다. 생성 시 관리자가 됩니다.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => navigate('/team/members')}
                className="px-4 py-2 bg-[#1e40af] text-white rounded-md text-sm hover:bg-[#1d3a9a]"
              >
                팀원 등록하러 가기
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 border border-red-500 text-red-600 rounded-md text-sm hover:bg-red-50"
              >
                팀 삭제
              </button>
            </div>
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
          <p className="text-sm text-gray-500 mb-3">새 팀을 만듭니다. (1인 1팀 — 생성 시 관리자가 됩니다.)</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">팀명</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
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
