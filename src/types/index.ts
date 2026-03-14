export interface Team {
  teamId: number
  teamName: string
  weekStartDay: number | null
  weekEndDay: number | null
  createdAt: string
  createdMemberId: number
}

export interface Member {
  memberId: number
  teamId: number | null
  doorayMemberId: string
  memberName: string
  managerYn: 'Y' | 'N'
  createdAt: string
  createdMemberId: number
}

export interface Tag {
  tagId: number
  teamId: number
  parentTagId: number | null
  tagName: string
  type: 'weekly' | 'monthly'
  createdAt: string
  createdMemberId: number
}

export type ReportType = 'daily' | 'weekly' | 'monthly' | 'review'

export interface Report {
  reportId: number
  memberId: number
  staDate: string
  endDate: string
  type: ReportType
  tomorrowPlan?: string | null
  createdAt: string
  createdMemberId: number
}

export interface ReportDetail {
  reportDetailId: number
  reportId: number
  tagId: number
  taskId: number
  taskTitle: string
  taskLink: string
  done: string
  workHours: number
  performance: string | null
  aiSummary?: string | null
  createdAt: string
  createdMemberId: number
}

export interface PeerReport {
  peerReportId: number
  reportId: number
  peerMemberId: number
  content: string | null
  createdAt: string
  createdMemberId: number
}

export interface ReportDetailTag {
  reportDetailTagId: number
  reportId: number
  tagId: number
  workHours: number
  type: 'review'
  aiSummary: string | null
  createdAt: string
  createdMemberId: number
}

export type ReportWithDetails = Report & {
  details?: ReportDetail[]
  reportDetailTags?: ReportDetailTag[]
  peerReports?: PeerReport[]
}
