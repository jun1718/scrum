import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMockData } from '@/hooks/useMockData'
import type { Tag } from '@/types'

const DAYS = [
  { value: 0, label: '일' },
  { value: 1, label: '월' },
  { value: 2, label: '화' },
  { value: 3, label: '수' },
  { value: 4, label: '목' },
  { value: 5, label: '금' },
  { value: 6, label: '토' },
]

export function TeamManagePage() {
  const navigate = useNavigate()
  const {
    teams,
    tags,
    currentTeamId,
    setTeams,
    setTags,
    weeklyTags,
    monthlyTags,
    members,
    currentMemberId: rawMemberId,
  } = useMockData()

  const currentMemberId = rawMemberId!
  const currentMember = members.find((m) => m.memberId === currentMemberId)
  const isManager = currentMember?.managerYn === 'Y'

  const [weekStartDay, setWeekStartDay] = useState<number | null>(null)
  const [weekEndDay, setWeekEndDay] = useState<number | null>(null)
  const [scheduleEditing, setScheduleEditing] = useState(false)
  const [scheduleError, setScheduleError] = useState('')
  const [tagEditing, setTagEditing] = useState(false)
  const [tagError, setTagError] = useState('')
  const [editingTags, setEditingTags] = useState<Tag[]>([])

  const currentTeam = currentTeamId ? teams.find((t) => t.teamId === currentTeamId) : null

  useEffect(() => {
    if (currentTeam) {
      setWeekStartDay(currentTeam.weekStartDay)
      setWeekEndDay(currentTeam.weekEndDay)
    }
  }, [currentTeam])

  // 편집 중인 태그 (편집 모드일 때는 로컬 상태, 아닐 때는 context 상태)
  const displayMonthlyTags = tagEditing
    ? editingTags.filter((t) => t.teamId === currentTeamId && t.parentTagId == null)
    : monthlyTags
  const displayWeeklyTags = tagEditing
    ? editingTags.filter((t) => t.teamId === currentTeamId && t.parentTagId != null)
    : weeklyTags

  const handleSaveSchedule = () => {
    if (!currentTeam) return
    setScheduleError('')
    if (weekStartDay == null || weekEndDay == null) {
      setScheduleError('시작 요일과 종료 요일을 모두 선택해주세요.')
      return
    }
    // 시작~종료가 정확히 7일(일주일)인지 검증: 종료일은 시작일 전날이어야 함
    const expectedEnd = (weekStartDay + 6) % 7
    if (weekEndDay !== expectedEnd) {
      const dayLabel = (d: number) => DAYS.find((v) => v.value === d)?.label
      setScheduleError(`시작~종료가 일주일이 되어야 합니다. 시작이 ${dayLabel(weekStartDay)}이면 종료는 ${dayLabel(expectedEnd)}이어야 합니다.`)
      return
    }
    setTeams(
      teams.map((t) =>
        t.teamId === currentTeam.teamId
          ? { ...t, weekStartDay, weekEndDay }
          : t
      )
    )
    setScheduleEditing(false)
  }

  const hasExistingSchedule = currentTeam?.weekStartDay != null && currentTeam?.weekEndDay != null

  const addWeeklyTag = (parentId: number) => {
    if (!currentTeamId) return
    const newId = Math.max(0, ...editingTags.map((t) => t.tagId), ...tags.map((t) => t.tagId)) + 1
    setEditingTags([
      ...editingTags,
      {
        tagId: newId,
        teamId: currentTeamId,
        parentTagId: parentId,
        tagName: '',
        type: 'weekly',
        createdAt: new Date().toISOString(),
        createdMemberId: 1,
      },
    ])
  }

  const addMonthlyTag = () => {
    if (!currentTeamId) return
    const newId = Math.max(0, ...editingTags.map((t) => t.tagId), ...tags.map((t) => t.tagId)) + 1
    setEditingTags([
      ...editingTags,
      {
        tagId: newId,
        teamId: currentTeamId,
        parentTagId: null,
        tagName: '',
        type: 'monthly',
        createdAt: new Date().toISOString(),
        createdMemberId: 1,
      },
    ])
  }

  const updateTag = (tagId: number, updates: Partial<Tag>) => {
    setEditingTags(editingTags.map((t) => (t.tagId === tagId ? { ...t, ...updates } : t)))
  }

  const removeTag = (tagId: number) => {
    const target = editingTags.find((t) => t.tagId === tagId)
    if (target?.type === 'monthly') {
      setEditingTags(editingTags.filter((t) => t.tagId !== tagId && t.parentTagId !== tagId))
    } else {
      setEditingTags(editingTags.filter((t) => t.tagId !== tagId))
    }
  }

  const handleSaveTags = () => {
    setTagError('')
    const editMonthly = editingTags.filter((t) => t.teamId === currentTeamId && t.parentTagId == null)
    const editWeekly = editingTags.filter((t) => t.teamId === currentTeamId && t.parentTagId != null)
    // 밸리데이션: 월간 태그명 비어있는지
    const emptyMonthly = editMonthly.some((mt) => !mt.tagName.trim())
    if (emptyMonthly) {
      setTagError('월간 태그(ESM명)를 입력해주세요.')
      return
    }
    // 밸리데이션: 월간 태그가 있는데 주간 태그가 하나도 없는 경우
    for (const mt of editMonthly) {
      const children = editWeekly.filter((wt) => wt.parentTagId === mt.tagId)
      if (children.length === 0) {
        setTagError(`"${mt.tagName}" 월간 태그에 주간 태그를 1개 이상 추가해주세요.`)
        return
      }
      const emptyChild = children.some((wt) => !wt.tagName.trim())
      if (emptyChild) {
        setTagError(`"${mt.tagName}" 하위 주간 태그명을 입력해주세요.`)
        return
      }
    }
    // 밸리데이션: 주간 태그만 있고 월간 태그가 없는 경우 (방어)
    if (editMonthly.length === 0 && editWeekly.length > 0) {
      setTagError('월간 태그(ESM명)를 먼저 추가해주세요.')
      return
    }
    // 밸리데이션 통과 → context에 반영 (Replace All)
    const otherTags = tags.filter((t) => t.teamId !== currentTeamId)
    setTags([...otherTags, ...editingTags])
    setTagEditing(false)
  }

  const hasExistingTags = monthlyTags.length > 0

  // 내가 속한 팀이 없으면 팀 등록 유도
  if (!currentTeamId) {
    return (
      <div className="bg-gray-50 min-h-full">
        <header className="h-14 bg-white border-b px-6 flex items-center">
          <h1 className="font-semibold text-gray-900">내 팀 설정</h1>
        </header>
        <div className="p-6 flex flex-col items-center justify-center min-h-[40vh] text-center">
          <p className="text-gray-500 mb-4">속한 팀을 먼저 등록해주세요. (1인 1팀)</p>
          <Link
            to="/team/assign"
            className="px-4 py-2 bg-[#1e40af] text-white rounded-md text-sm hover:bg-[#1d3a9a]"
          >
            팀 등록하기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="h-14 bg-white border-b px-6 flex items-center">
        <h1 className="font-semibold text-gray-900">내 팀 설정</h1>
      </header>
      <div className="p-6 space-y-6">
        {!isManager && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">읽기 전용 모드입니다. 설정 변경은 관리자만 가능합니다.</p>
          </div>
        )}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-medium text-gray-900 mb-3">내 팀 정보</h2>
          <p className="text-sm text-gray-600">{currentTeam?.teamName}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-900">주간 보고 시작/종료 요일</h2>
            {isManager && (
              <div className="flex items-center gap-2">
                {scheduleEditing ? (
                  <button
                    type="button"
                    onClick={handleSaveSchedule}
                    className="px-3 py-1.5 bg-[#1e40af] text-white rounded-md text-sm hover:bg-[#1d3a9a]"
                  >
                    저장
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setScheduleEditing(true); setScheduleError('') }}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                  >
                    {hasExistingSchedule ? '수정' : '설정'}
                  </button>
                )}
              </div>
            )}
          </div>
          {scheduleError && (
            <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{scheduleError}</p>
            </div>
          )}
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="block text-xs text-gray-500 mb-1">시작 요일</label>
              <select
                value={weekStartDay ?? ''}
                onChange={(e) => setWeekStartDay(e.target.value ? Number(e.target.value) : null)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"
                disabled={!scheduleEditing}
              >
                <option value="">선택</option>
                {DAYS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">종료 요일</label>
              <select
                value={weekEndDay ?? ''}
                onChange={(e) => setWeekEndDay(e.target.value ? Number(e.target.value) : null)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"
                disabled={!scheduleEditing}
              >
                <option value="">선택</option>
                {DAYS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-900">태그 설정</h2>
            {isManager && (
              <div className="flex items-center gap-2">
                {tagEditing ? (
                  <button
                    type="button"
                    onClick={handleSaveTags}
                    className="px-3 py-1.5 bg-[#1e40af] text-white rounded-md text-sm hover:bg-[#1d3a9a]"
                  >
                    저장
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const teamTags = tags.filter((t) => t.teamId === currentTeamId)
                      setEditingTags(teamTags)
                      setTagEditing(true)
                      setTagError('')
                      if (!hasExistingTags) {
                        // 태그가 없으면 첫 월간 태그 자동 추가
                        const newId = Math.max(0, ...tags.map((t) => t.tagId)) + 1
                        setEditingTags([{
                          tagId: newId,
                          teamId: currentTeamId!,
                          parentTagId: null,
                          tagName: '',
                          type: 'monthly',
                          createdAt: new Date().toISOString(),
                          createdMemberId: 1,
                        }])
                      }
                    }}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                  >
                    {hasExistingTags ? '수정' : '추가'}
                  </button>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 mb-3">월간 태그(ESM명) 안에 주간 태그가 트리 형태로 구성됩니다.</p>
          {tagError && (
            <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{tagError}</p>
            </div>
          )}
          <div className="space-y-3">
            {displayMonthlyTags.map((mt) => {
              const children = displayWeeklyTags.filter((wt) => wt.parentTagId === mt.tagId)
              return (
                <div key={mt.tagId} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                  {/* 월간 태그 */}
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-gray-400 shrink-0 w-20">월간(ESM명)</span>
                    <input
                      type="text"
                      value={mt.tagName}
                      onChange={(e) => updateTag(mt.tagId, { tagName: e.target.value })}
                      className="border border-gray-300 rounded-md px-2 py-1.5 text-sm w-40 disabled:bg-gray-100 disabled:text-gray-500"
                      placeholder="월간 태그(ESM명)"
                      disabled={!tagEditing}
                    />
                    {tagEditing && (
                      <button
                        type="button"
                        onClick={() => removeTag(mt.tagId)}
                        className="text-red-500 hover:underline text-xs"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  {/* 하위 주간 태그 */}
                  <div className="ml-6 mt-2 space-y-1.5">
                    {children.map((wt) => (
                      <div key={wt.tagId} className="flex gap-2 items-center">
                        <span className="text-xs text-gray-300 shrink-0">└</span>
                        <input
                          type="text"
                          value={wt.tagName}
                          onChange={(e) => updateTag(wt.tagId, { tagName: e.target.value })}
                          className="border border-gray-200 rounded-md px-2 py-1 text-sm w-36 disabled:bg-gray-100 disabled:text-gray-500"
                          placeholder="주간 태그명"
                          disabled={!tagEditing}
                        />
                        {tagEditing && (
                          <button
                            type="button"
                            onClick={() => removeTag(wt.tagId)}
                            className="text-red-500 hover:underline text-xs"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    ))}
                    {tagEditing && (
                      <button
                        type="button"
                        onClick={() => addWeeklyTag(mt.tagId)}
                        className="text-xs text-blue-600 hover:underline ml-4"
                      >
                        + 주간 태그 추가
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
            {tagEditing && (
              <button
                type="button"
                onClick={addMonthlyTag}
                className="text-sm text-blue-600 hover:underline"
              >
                + 월간 태그(ESM명) 추가
              </button>
            )}
            {!tagEditing && displayMonthlyTags.length === 0 && (
              <p className="text-sm text-gray-400">등록된 태그가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 팀원 등록하기 바로가기 */}
        <div>
          <button
            type="button"
            onClick={() => navigate('/team/members')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50"
          >
            팀원 등록하기로 이동
          </button>
        </div>
      </div>
    </div>
  )
}
