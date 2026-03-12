import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useToast } from './Toast'

interface NavPanelProps {
  teamName?: string | null
  hasTeam?: boolean
}

const TEAM_SHARE_ITEMS = [
  { tab: 'daily', label: '일간 보고' },
  { tab: 'weekly', label: '주간 보고' },
  { tab: 'monthly', label: '월간 보고' },
]

const NO_TEAM_MSG = '팀을 먼저 생성하거나 팀원들에게 멤버등록을 요청하세요.'

function TeamShareLinks({ hasTeam }: { hasTeam: boolean }) {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const toast = useToast()
  const currentTab = pathname === '/team/share' ? (new URLSearchParams(search).get('tab') ?? 'daily') : null

  return (
    <>
      {TEAM_SHARE_ITEMS.map(({ tab, label }) => {
        const isActive = currentTab === tab
        return (
          <button
            key={tab}
            type="button"
            onClick={() => {
              if (!hasTeam) { toast(NO_TEAM_MSG); return }
              navigate(`/team/share?tab=${tab}`)
            }}
            className={`flex items-center gap-3 px-4 py-2 mx-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${
              isActive ? 'bg-blue-50 text-blue-600 font-medium' : ''
            }`}
          >
            <span className="w-4 h-4 text-gray-400">•</span>
            {label}
          </button>
        )
      })}
    </>
  )
}

export function NavPanel({ teamName, hasTeam = false }: NavPanelProps) {
  const navigate = useNavigate()
  const toast = useToast()
  const [teamMenuOpen, setTeamMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setTeamMenuOpen(false)
      }
    }
    if (teamMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [teamMenuOpen])

  const teamMenuItems = hasTeam
    ? [
        { to: '/team/members', label: '팀원 등록하기' },
        { to: '/team/manage', label: '팀 정보 세팅' },
      ]
    : []

  const handleNoTeam = () => toast(NO_TEAM_MSG)

  return (
    <nav className="w-60 shrink-0 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-lg text-gray-900">슈크럼</h1>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setTeamMenuOpen(!teamMenuOpen)}
              className="flex items-center p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              title="팀설정"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs">팀 설정</span>
            </button>
            {teamMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <p className="px-3 py-1.5 text-xs text-gray-400">팀설정</p>
                {!hasTeam ? (
                  <div className="px-3 py-3">
                    <p className="text-sm text-gray-500 leading-relaxed">
                      팀을 먼저 생성하거나 팀원들에게 멤버등록을 요청하세요.
                    </p>
                    <button
                      type="button"
                      onClick={() => setTeamMenuOpen(false)}
                      className="mt-2 w-full px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                    >
                      확인
                    </button>
                  </div>
                ) : (
                  teamMenuItems.map(({ to, label }) => (
                    <button
                      key={to}
                      type="button"
                      onClick={() => { navigate(to); setTeamMenuOpen(false) }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {label}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        {teamName && (
          <p className="text-sm text-gray-500 mt-0.5">속한 팀: {teamName}</p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {/* 핵심 CTA: 데일리 슈크럼 작성 */}
        <div className="px-3 pt-3 pb-2">
          {hasTeam ? (
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#1e40af] text-white shadow-md'
                    : 'bg-blue-50 text-[#1e40af] hover:bg-blue-100 border border-blue-200'
                }`
              }
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              데일리 슈크럼 작성
            </NavLink>
          ) : (
            <button
              type="button"
              onClick={handleNoTeam}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-colors bg-blue-50 text-[#1e40af] hover:bg-blue-100 border border-blue-200 w-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              데일리 슈크럼 작성
            </button>
          )}
        </div>

        {/* 개인 보고 */}
        <div className="mb-1">
          <p className="text-xs text-gray-400 uppercase tracking-wider px-4 pt-4 pb-1">개인</p>
          {[
            { to: '/reports/daily', label: '일간 보고' },
            { to: '/reports/weekly', label: '주간 보고' },
            { to: '/reports/monthly', label: '월간 보고' },
            { to: '/reports/review', label: '성과 보고' },
          ].map(({ to, label }) => (
            hasTeam ? (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 mx-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 ${
                    isActive ? 'bg-blue-50 text-blue-600 font-medium' : ''
                  }`
                }
              >
                <span className="w-4 h-4 text-gray-400">•</span>
                {label}
              </NavLink>
            ) : (
              <button
                key={to}
                type="button"
                onClick={handleNoTeam}
                className="flex items-center gap-3 px-4 py-2 mx-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <span className="w-4 h-4 text-gray-400">•</span>
                {label}
              </button>
            )
          ))}
        </div>

        {/* 팀 공유 (조회 전용) */}
        <div className="mb-1">
          <p className="text-xs text-gray-400 uppercase tracking-wider px-4 pt-4 pb-1">팀 공유</p>
          <TeamShareLinks hasTeam={hasTeam} />
        </div>
      </div>
    </nav>
  )
}
