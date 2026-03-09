import { useState, useEffect, useCallback } from 'react'
import type {
  Team,
  Member,
  Tag,
  Report,
  ReportDetail,
  PeerReport,
  ReportTag,
} from '@/types'

const BASE = '/mock'

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`Failed to fetch ${path}`)
  return res.json()
}

const STORAGE_KEYS = {
  teams: 'scrum_teams',
  members: 'scrum_members',
  tags: 'scrum_tags',
  reports: 'scrum_reports',
  reportDetails: 'scrum_reportDetails',
  peerReports: 'scrum_peerReports',
  reportTags: 'scrum_reportTags',
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

export function useMockData() {
  const [teams, setTeams] = useState<Team[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [reportDetails, setReportDetails] = useState<ReportDetail[]>([])
  const [peerReports, setPeerReports] = useState<PeerReport[]>([])
  const [reportTags, setReportTags] = useState<ReportTag[]>([])
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [currentTeamIdState, setCurrentTeamIdState] = useState<number | null>(() =>
    loadFromStorage<number>(STORAGE_KEYS.currentTeamId)
  )

  const loadInitial = useCallback(async () => {
    const hasData = loadFromStorage<Team[]>(STORAGE_KEYS.teams)
    if (hasData && hasData.length > 0) {
      setTeams(loadFromStorage<Team[]>(STORAGE_KEYS.teams) ?? [])
      setCurrentTeamIdState(loadFromStorage<number>(STORAGE_KEYS.currentTeamId))
      setMembers(loadFromStorage<Member[]>(STORAGE_KEYS.members) ?? [])
      setTags(loadFromStorage<Tag[]>(STORAGE_KEYS.tags) ?? [])
      setReports(loadFromStorage<Report[]>(STORAGE_KEYS.reports) ?? [])
      setReportDetails(loadFromStorage<ReportDetail[]>(STORAGE_KEYS.reportDetails) ?? [])
      setPeerReports(loadFromStorage<PeerReport[]>(STORAGE_KEYS.peerReports) ?? [])
      setReportTags(loadFromStorage<ReportTag[]>(STORAGE_KEYS.reportTags) ?? [])
    } else {
      const [t, m, tg, r, rd, pr, rt] = await Promise.all([
        fetchJson<Team[]>('/teams.json'),
        fetchJson<Member[]>('/members.json'),
        fetchJson<Tag[]>('/tags.json'),
        fetchJson<Report[]>('/reports.json'),
        fetchJson<ReportDetail[]>('/reportDetails.json'),
        fetchJson<PeerReport[]>('/peerReports.json'),
        fetchJson<ReportTag[]>('/reportTags.json'),
      ])
      setTeams(t)
      setMembers(m)
      setTags(tg)
      setReports(r)
      setReportDetails(rd)
      setPeerReports(pr)
      setReportTags(rt)
      saveToStorage(STORAGE_KEYS.teams, t)
      saveToStorage(STORAGE_KEYS.members, m)
      saveToStorage(STORAGE_KEYS.tags, tg)
      saveToStorage(STORAGE_KEYS.reports, r)
      saveToStorage(STORAGE_KEYS.reportDetails, rd)
      saveToStorage(STORAGE_KEYS.peerReports, pr)
      saveToStorage(STORAGE_KEYS.reportTags, rt)
      if (!loadFromStorage<number>(STORAGE_KEYS.currentMemberId)) {
        saveToStorage(STORAGE_KEYS.currentMemberId, 1)
      }
    }
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
    saveToStorage(STORAGE_KEYS.reportTags, reportTags)
  }, [teams, members, tags, reports, reportDetails, peerReports, reportTags])

  useEffect(() => {
    if (!initialized) return
    persist()
  }, [initialized, teams, members, tags, reports, reportDetails, peerReports, reportTags, persist])

  const currentMemberId = loadFromStorage<number>(STORAGE_KEYS.currentMemberId) ?? 1
  const currentTeamId = currentTeamIdState ?? loadFromStorage<number>(STORAGE_KEYS.currentTeamId)

  const setCurrentTeamId = useCallback((teamId: number | null) => {
    setCurrentTeamIdState(teamId)
    if (teamId === null) localStorage.removeItem(STORAGE_KEYS.currentTeamId)
    else saveToStorage(STORAGE_KEYS.currentTeamId, teamId)
  }, [])

  const currentMember = members.find((m) => m.memberId === currentMemberId) ?? null
  const currentTeam =
    currentTeamId != null ? (teams.find((t) => t.teamId === currentTeamId) ?? null) : null

  const teamTags: Tag[] = currentTeamId == null ? [] : tags.filter((t) => t.teamId === currentTeamId)
  const weeklyTags = teamTags.filter((t) => t.type === 'weekly')
  const monthlyTags = teamTags.filter((t) => t.type === 'monthly')

  const myReports = reports.filter((r) => r.memberId === currentMemberId);
  const detailsByReportId = reportDetails.reduce(
    (acc, d) => {
      if (!acc[d.reportId]) acc[d.reportId] = []
      acc[d.reportId].push(d)
      return acc
    },
    {} as Record<number, ReportDetail[]>
  )
  const reportTagsByReportId = reportTags.reduce(
    (acc, rt) => {
      if (!acc[rt.reportId]) acc[rt.reportId] = []
      acc[rt.reportId].push(rt)
      return acc
    },
    {} as Record<number, ReportTag[]>
  )
  const peerReportsByReportId = peerReports.reduce(
    (acc, pr) => {
      if (!acc[pr.reportId]) acc[pr.reportId] = []
      acc[pr.reportId].push(pr)
      return acc
    },
    {} as Record<number, PeerReport[]>
  )

  return {
    loading,
    initialized,
    teams,
    members,
    tags,
    reports,
    reportDetails,
    peerReports,
    reportTags,
    setTeams,
    setMembers,
    setTags,
    setReports,
    setReportDetails,
    setPeerReports,
    setReportTags,
    currentMemberId,
    currentTeamId,
    setCurrentTeamId,
    currentMember,
    currentTeam,
    teamTags,
    weeklyTags,
    monthlyTags,
    myReports,
    detailsByReportId,
    reportTagsByReportId,
    peerReportsByReportId,
  }
}
