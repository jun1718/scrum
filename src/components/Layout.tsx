import { Outlet, useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { TopHeader } from './TopHeader'
import { IconSidebar } from './IconSidebar'
import { NavPanel } from './NavPanel'
import { useMockData } from '@/hooks/useMockData'

function EmptyTeamState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 bg-gray-50">
      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl mb-4">
        👋
      </div>
      <p className="text-gray-500 text-lg mb-4">팀을 지정해주세요.</p>
      <Link
        to="/team/assign"
        className="px-4 py-2 bg-[#1e40af] text-white rounded-md text-sm hover:bg-[#1d3a9a]"
      >
        팀 지정하기
      </Link>
    </div>
  )
}

export function Layout() {
  const { currentTeam, currentTeamId, loading } = useMockData()
  const { pathname } = useLocation()
  const isTeamSetup = pathname.startsWith('/team/manage') || pathname.startsWith('/team/assign') || pathname.startsWith('/team/create')
  const isMainPage = pathname === '/'
  // 메인(/)은 팀 여부와 관계없이 데일리 슈크럼 작성. 팀 생성/지정/설정·팀 업무 공유만 팀 필요 시 빈 상태
  const showEmpty = !loading && !currentTeamId && !isTeamSetup && !isMainPage

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
