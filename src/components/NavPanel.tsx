import { NavLink } from 'react-router-dom'

interface NavPanelProps {
  teamName?: string | null
  hasTeam?: boolean
}

interface NavLinkItem {
  to: string
  label: string
  end?: boolean
}

function getNavItems(hasTeam: boolean): { section: string; links: NavLinkItem[] }[] {
  const teamLinks: NavLinkItem[] = hasTeam
    ? [
        { to: '/team/create', label: '팀 생성하기' },
        { to: '/team/members', label: '팀원 지정하기' },
        { to: '/team/manage', label: '시작/종료일자·태그 설정' },
      ]
    : [
        { to: '/team/create', label: '팀 생성하기' },
        { to: '/team/assign', label: '팀 지정하기' },
        { to: '/team/manage', label: '시작/종료일자·태그 설정' },
      ]
  return [
    { section: '팀', links: teamLinks },
    { section: '보고', links: [
      { to: '/', label: '데일리 슈크럼 작성', end: true },
      { to: '/team/share', label: '팀 업무 공유' },
    ]},
  ]
}

export function NavPanel({ teamName, hasTeam = false }: NavPanelProps) {
  const navItems = getNavItems(hasTeam)
  return (
    <nav className="w-60 shrink-0 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-100">
        <h1 className="font-bold text-lg text-gray-900">슈크럼</h1>
        {teamName && (
          <p className="text-sm text-gray-500 mt-0.5">속한 팀: {teamName}</p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {navItems.map(({ section, links }) => (
          <div key={section} className="mb-2">
            <p className="text-xs text-gray-400 uppercase tracking-wider px-4 pt-4 pb-1">
              {section}
            </p>
            {links.map(({ to, label, end }) => (
              <NavLink
                key={label}
                to={to}
                end={!!end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 ${
                    isActive ? 'bg-blue-50 text-blue-600 font-medium' : ''
                  }`
                }
              >
                <span className="w-4 h-4 text-gray-400">•</span>
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </div>
    </nav>
  )
}
