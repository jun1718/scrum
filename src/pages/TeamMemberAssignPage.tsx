import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMockData } from '@/hooks/useMockData'

export function TeamMemberAssignPage() {
  const navigate = useNavigate()
  const { loading, currentTeam, members, setMembers, currentMemberId: rawMemberId } = useMockData()
  const currentMemberId = rawMemberId!
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')

  const currentMember = members.find((m) => m.memberId === currentMemberId)
  const isManager = currentMember?.managerYn === 'Y'

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-full">
        <header className="h-14 bg-white border-b px-6 flex items-center">
          <h1 className="font-semibold text-gray-900">팀원 등록하기</h1>
        </header>
        <div className="p-6">
          <p className="text-sm text-gray-500">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!currentTeam) {
    return (
      <div className="bg-gray-50 min-h-full">
        <header className="h-14 bg-white border-b px-6 flex items-center">
          <h1 className="font-semibold text-gray-900">팀원 등록하기</h1>
        </header>
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-w-md">
            <p className="text-sm text-gray-500">
              현재 선택된 팀이 없습니다. 먼저 팀을 등록하거나 생성해주세요.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const teamMembers = useMemo(
    () => members.filter((m) => m.teamId === currentTeam.teamId),
    [members, currentTeam.teamId]
  )

  const handleAdd = () => {
    setError('')
    const trimmed = newName.trim()
    if (!trimmed) {
      setError('이름을 입력해주세요.')
      return
    }
    const newId = Math.max(0, ...members.map((m) => m.memberId)) + 1
    setMembers([
      ...members,
      {
        memberId: newId,
        teamId: currentTeam.teamId,
        doorayMemberId: '',
        memberName: trimmed,
        managerYn: 'N',
        createdAt: new Date().toISOString(),
        createdMemberId: newId,
      },
    ])
    setNewName('')
  }

  const handleRemove = (memberId: number) => {
    setMembers(
      members.map((m) =>
        m.memberId === memberId ? { ...m, teamId: null } : m
      )
    )
  }

  const handleToggleManager = (memberId: number) => {
    setMembers(
      members.map((m) =>
        m.memberId === memberId
          ? { ...m, managerYn: m.managerYn === 'Y' ? 'N' : 'Y' }
          : m
      )
    )
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="h-14 bg-white border-b px-6 flex items-center justify-between">
        <h1 className="font-semibold text-gray-900">팀원 등록하기</h1>
        <p className="text-sm text-gray-500">대상 팀: {currentTeam.teamName}</p>
      </header>
      <div className="p-6 space-y-6">
        {!isManager && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-2xl">
            <p className="text-sm text-yellow-800">읽기 전용 모드입니다. 팀원 등록 및 관리자 지정은 관리자만 가능합니다.</p>
          </div>
        )}
        {/* 새 팀원 등록 */}
        {isManager && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-w-2xl">
            <h2 className="text-sm font-medium text-gray-700 mb-3">새 팀원 등록</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setError('') }}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="팀원 이름 입력"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAdd}
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
              >
                등록
              </button>
            </div>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            <p className="text-xs text-gray-400 mt-2">
              [프로토타입] 이름 입력으로 멤버를 생성합니다. 실서비스에서는 Dooray API로 사원 정보를 조회합니다.
            </p>
          </div>
        )}

        {/* 현재 팀원 목록 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-w-2xl">
          <h2 className="text-sm font-medium text-gray-700 mb-3">
            현재 팀원 ({teamMembers.length}명)
          </h2>
          {teamMembers.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">아직 팀원이 없습니다.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {teamMembers.map((m) => (
                <li key={m.memberId} className="py-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{m.memberName}</p>
                    {m.managerYn === 'Y' && (
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">관리자</span>
                    )}
                    {m.memberId === currentMemberId && (
                      <span className="text-xs text-gray-400">(나)</span>
                    )}
                  </div>
                  {isManager && (
                    <div className="flex items-center gap-2">
                      {m.memberId === currentMemberId && m.managerYn === 'Y' ? (
                        <span className="px-3 py-1.5 text-xs text-gray-400">본인 관리자 권한은 해제할 수 없습니다</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleManager(m.memberId)}
                          className={`px-3 py-1.5 border rounded-md text-sm ${
                            m.managerYn === 'Y'
                              ? 'border-blue-300 text-blue-600 hover:bg-blue-50'
                              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {m.managerYn === 'Y' ? '관리자 해제' : '관리자 지정'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemove(m.memberId)}
                        className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-md text-sm hover:bg-gray-50"
                      >
                        등록 해제
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 팀 정보 세팅 바로가기 */}
        <div className="max-w-2xl">
          <button
            type="button"
            onClick={() => navigate('/team/manage')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50"
          >
            팀 정보 세팅으로 이동
          </button>
        </div>
      </div>
    </div>
  )
}
