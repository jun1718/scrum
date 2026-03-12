import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { TopHeader } from './TopHeader'
import { IconSidebar } from './IconSidebar'
import { NavPanel } from './NavPanel'
import { useMockData } from '@/hooks/useMockData'

function EmptyTeamState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 bg-gray-50">
      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl mb-4">
        👋
      </div>
      <p className="text-gray-500 text-lg mb-4">팀을 먼저 생성하거나 팀원들에게 멤버등록을 요청하세요.</p>
      <Link
        to="/team/create"
        className="px-4 py-2 bg-[#1e40af] text-white rounded-md text-sm hover:bg-[#1d3a9a]"
      >
        팀 생성하기
      </Link>
    </div>
  )
}

function RegisterScreen({ onRegister }: { onRegister: (name: string) => void }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('이름을 입력해주세요.')
      return
    }
    onRegister(trimmed)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopHeader />
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-sm w-full mx-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">SUPER Scrum</h2>
          <p className="text-sm text-gray-500 mb-2">시작하려면 이름을 입력해주세요.</p>
          <p className="text-xs text-gray-400 mb-6">[프로토타입] 실서비스에서는 Dooray API Token을 입력받아 인증 처리합니다.</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError('') }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="예: 홍길동"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full px-4 py-2 bg-[#1e40af] text-white rounded-md text-sm hover:bg-[#1d3a9a]"
            >
              시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Layout() {
  const { currentMemberId, currentTeam, currentTeamId, loading, members, setMembers, setCurrentMemberId } = useMockData()
  const { pathname } = useLocation()
  const isTeamSetup = pathname.startsWith('/team/manage') || pathname.startsWith('/team/assign') || pathname.startsWith('/team/create') || pathname.startsWith('/team/members')
  const showEmpty = !loading && !currentTeamId && !isTeamSetup

  const handleRegister = (name: string) => {
    const newId = Math.max(0, ...members.map((m) => m.memberId)) + 1
    const newMember = {
      memberId: newId,
      teamId: null,
      doorayMemberId: '',
      memberName: name,
      managerYn: 'N' as const,
      createdAt: new Date().toISOString(),
      createdMemberId: newId,
    }
    setMembers([...members, newMember])
    setCurrentMemberId(newId)
  }

  if (!loading && currentMemberId == null) {
    return <RegisterScreen onRegister={handleRegister} />
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopHeader />
      <div className="flex flex-1 min-h-0">
        <IconSidebar />
        <NavPanel teamName={currentTeam?.teamName} hasTeam={currentTeamId != null} />
        <main className="flex-1 overflow-auto bg-white">
          {showEmpty ? <EmptyTeamState /> : <Outlet />}
        </main>
      </div>
    </div>
  )
}
