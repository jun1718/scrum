import { useState, useMemo } from 'react'
import { useMockData } from '@/hooks/useMockData'

export function TeamMemberAssignPage() {
  const { currentTeam, members, setMembers } = useMockData()
  const [search, setSearch] = useState('')

  if (!currentTeam) {
    return (
      <div className="bg-gray-50 min-h-full">
        <header className="h-14 bg-white border-b px-6 flex items-center">
          <h1 className="font-semibold text-gray-900">팀원 지정하기</h1>
        </header>
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-w-md">
            <p className="text-sm text-gray-500">
              현재 선택된 팀이 없습니다. 먼저 팀을 지정하거나 생성해주세요.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return members
    return members.filter(
      (m) =>
        m.memberName.toLowerCase().includes(q) ||
        m.doorayMemberId.toLowerCase().includes(q)
    )
  }, [members, search])

  const handleAssign = (memberId: number) => {
    setMembers(
      members.map((m) =>
        m.memberId === memberId ? { ...m, teamId: currentTeam.teamId } : m
      )
    )
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="h-14 bg-white border-b px-6 flex items-center justify-between">
        <h1 className="font-semibold text-gray-900">팀원 지정하기</h1>
        <p className="text-sm text-gray-500">대상 팀: {currentTeam.teamName}</p>
      </header>
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-w-2xl">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이름 / 이메일 검색
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름 또는 이메일 입력"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <ul className="mt-4 divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <li className="py-4 text-sm text-gray-500">
                검색 결과가 없습니다.
              </li>
            ) : (
              filtered.map((m) => (
                <li
                  key={m.memberId}
                  className="py-3 flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {m.memberName}
                    </p>
                    <p className="text-xs text-gray-500">{m.doorayMemberId}</p>
                    {m.teamId === currentTeam.teamId && (
                      <p className="text-xs text-blue-600 mt-0.5">
                        현재 이 팀에 지정됨
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAssign(m.memberId)}
                    className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                  >
                    이 팀으로 지정
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

