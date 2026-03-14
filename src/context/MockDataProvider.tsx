import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type {
  Team,
  Member,
  Tag,
  Report,
  ReportDetail,
  PeerReport,
  ReportDetailTag,
} from '@/types'

const STORAGE_KEYS = {
  teams: 'scrum_teams',
  members: 'scrum_members',
  tags: 'scrum_tags',
  reports: 'scrum_reports',
  reportDetails: 'scrum_reportDetails',
  peerReports: 'scrum_peerReports',
  reportDetailTags: 'scrum_reportDetailTags',
  currentMemberId: 'scrum_currentMemberId',
  currentTeamId: 'scrum_currentTeamId',
} as const

function loadFromStorage<T>(key: string): T | null {
  try {
    const s = localStorage.getItem(key)
    return s ? (JSON.parse(s) as T) : null
  } catch {
    return null
  }
}

function saveToStorage(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export interface MockDataContextValue {
  loading: boolean
  initialized: boolean
  teams: Team[]
  members: Member[]
  tags: Tag[]
  reports: Report[]
  reportDetails: ReportDetail[]
  peerReports: PeerReport[]
  reportDetailTags: ReportDetailTag[]
  setTeams: Dispatch<SetStateAction<Team[]>>
  setMembers: Dispatch<SetStateAction<Member[]>>
  setTags: Dispatch<SetStateAction<Tag[]>>
  setReports: Dispatch<SetStateAction<Report[]>>
  setReportDetails: Dispatch<SetStateAction<ReportDetail[]>>
  setPeerReports: Dispatch<SetStateAction<PeerReport[]>>
  setReportDetailTags: Dispatch<SetStateAction<ReportDetailTag[]>>
  currentMemberId: number | null
  currentTeamId: number | null
  setCurrentMemberId: (memberId: number | null) => void
  setCurrentTeamId: (teamId: number | null) => void
  currentMember: Member | null
  currentTeam: Team | null
  teamTags: Tag[]
  weeklyTags: Tag[]
  monthlyTags: Tag[]
  myReports: Report[]
  detailsByReportId: Record<number, ReportDetail[]>
  reportDetailTagsByReportId: Record<number, ReportDetailTag[]>
  peerReportsByReportId: Record<number, PeerReport[]>
}

const MockDataContext = createContext<MockDataContextValue | null>(null)

export function MockDataProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [reportDetails, setReportDetails] = useState<ReportDetail[]>([])
  const [peerReports, setPeerReports] = useState<PeerReport[]>([])
  const [reportDetailTags, setReportDetailTags] = useState<ReportDetailTag[]>([])
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [currentMemberIdState, setCurrentMemberIdState] = useState<number | null>(
    () => loadFromStorage<number>(STORAGE_KEYS.currentMemberId)
  )
  const [currentTeamIdState, setCurrentTeamIdState] = useState<number | null>(
    () => loadFromStorage<number>(STORAGE_KEYS.currentTeamId)
  )

  const loadInitial = useCallback(() => {
    setTeams(loadFromStorage<Team[]>(STORAGE_KEYS.teams) ?? [])
    setMembers(loadFromStorage<Member[]>(STORAGE_KEYS.members) ?? [])
    setTags(loadFromStorage<Tag[]>(STORAGE_KEYS.tags) ?? [])
    setReports(loadFromStorage<Report[]>(STORAGE_KEYS.reports) ?? [])
    setReportDetails(loadFromStorage<ReportDetail[]>(STORAGE_KEYS.reportDetails) ?? [])
    setPeerReports(loadFromStorage<PeerReport[]>(STORAGE_KEYS.peerReports) ?? [])
    setReportDetailTags(loadFromStorage<ReportDetailTag[]>(STORAGE_KEYS.reportDetailTags) ?? [])
    setInitialized(true)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  const persist = useCallback(() => {
    saveToStorage(STORAGE_KEYS.teams, teams)
    saveToStorage(STORAGE_KEYS.members, members)
    saveToStorage(STORAGE_KEYS.tags, tags)
    saveToStorage(STORAGE_KEYS.reports, reports)
    saveToStorage(STORAGE_KEYS.reportDetails, reportDetails)
    saveToStorage(STORAGE_KEYS.peerReports, peerReports)
    saveToStorage(STORAGE_KEYS.reportDetailTags, reportDetailTags)
  }, [teams, members, tags, reports, reportDetails, peerReports, reportDetailTags])

  useEffect(() => {
    if (!initialized) return
    persist()
  }, [
    initialized,
    teams,
    members,
    tags,
    reports,
    reportDetails,
    peerReports,
    reportDetailTags,
    persist,
  ])

  const currentMemberId = currentMemberIdState
  const currentTeamId = currentTeamIdState

  const setCurrentMemberId = useCallback((memberId: number | null) => {
    setCurrentMemberIdState(memberId)
    if (memberId === null) localStorage.removeItem(STORAGE_KEYS.currentMemberId)
    else saveToStorage(STORAGE_KEYS.currentMemberId, memberId)
  }, [])

  const setCurrentTeamId = useCallback((teamId: number | null) => {
    setCurrentTeamIdState(teamId)
    if (teamId === null) localStorage.removeItem(STORAGE_KEYS.currentTeamId)
    else saveToStorage(STORAGE_KEYS.currentTeamId, teamId)
  }, [])

  const currentMember =
    currentMemberId != null
      ? (members.find((m) => m.memberId === currentMemberId) ?? null)
      : null
  const currentTeam =
    currentTeamId != null
      ? (teams.find((t) => t.teamId === currentTeamId) ?? null)
      : null

  const teamTags: Tag[] =
    currentTeamId == null ? [] : tags.filter((t) => t.teamId === currentTeamId)
  const weeklyTags = teamTags.filter((t) => t.type === 'weekly')
  const monthlyTags = teamTags.filter((t) => t.type === 'monthly')

  const myReports = currentMemberId != null
    ? reports.filter((r) => r.memberId === currentMemberId)
    : []
  const detailsByReportId = reportDetails.reduce(
    (acc, d) => {
      if (!acc[d.reportId]) acc[d.reportId] = []
      acc[d.reportId].push(d)
      return acc
    },
    {} as Record<number, ReportDetail[]>
  )
  const reportDetailTagsByReportId = reportDetailTags.reduce(
    (acc, rt) => {
      if (!acc[rt.reportId]) acc[rt.reportId] = []
      acc[rt.reportId].push(rt)
      return acc
    },
    {} as Record<number, ReportDetailTag[]>
  )
  const peerReportsByReportId = peerReports.reduce(
    (acc, pr) => {
      if (!acc[pr.reportId]) acc[pr.reportId] = []
      acc[pr.reportId].push(pr)
      return acc
    },
    {} as Record<number, PeerReport[]>
  )

  const value: MockDataContextValue = {
    loading,
    initialized,
    teams,
    members,
    tags,
    reports,
    reportDetails,
    peerReports,
    reportDetailTags,
    setTeams,
    setMembers,
    setTags,
    setReports,
    setReportDetails,
    setPeerReports,
    setReportDetailTags,
    currentMemberId,
    currentTeamId,
    setCurrentMemberId,
    setCurrentTeamId,
    currentMember,
    currentTeam,
    teamTags,
    weeklyTags,
    monthlyTags,
    myReports,
    detailsByReportId,
    reportDetailTagsByReportId,
    peerReportsByReportId,
  }

  return (
    <MockDataContext.Provider value={value}>
      {children}
    </MockDataContext.Provider>
  )
}

export function useMockDataContext(): MockDataContextValue {
  const ctx = useContext(MockDataContext)
  if (!ctx) {
    throw new Error('useMockData must be used within MockDataProvider')
  }
  return ctx
}
