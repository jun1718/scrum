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
  const [scheduleSaved, setScheduleSaved] = useState(false)

  const currentTeam = currentTeamId ? teams.find((t) => t.teamId === currentTeamId) : null

  useEffect(() => {
    if (currentTeam) {
      setWeekStartDay(currentTeam.weekStartDay)
      setWeekEndDay(currentTeam.weekEndDay)
    }
  }, [currentTeam])

  const handleSaveSchedule = () => {
    if (!currentTeam) return
    setTeams(
      teams.map((t) =>
        t.teamId === currentTeam.teamId
          ? { ...t, weekStartDay, weekEndDay }
          : t
      )
    )
    setScheduleSaved(true)
    setTimeout(() => setScheduleSaved(false), 2000)
  }

  const addWeeklyTag = (parentId: number) => {
    if (!currentTeamId) return
    const newId = Math.max(0, ...tags.map((t) => t.tagId)) + 1
    setTags([
      ...tags,
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
    const newId = Math.max(0, ...tags.map((t) => t.tagId)) + 1
    setTags([
      ...tags,
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
    setTags(tags.map((t) => (t.tagId === tagId ? { ...t, ...updates } : t)))
  }

  const removeTag = (tagId: number) => {
    setTags(tags.filter((t) => t.tagId !== tagId))
  }

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
          <h2 className="text-sm font-medium text-gray-900 mb-3">주간 보고 시작/종료 요일</h2>
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="block text-xs text-gray-500 mb-1">시작 요일</label>
              <select
                value={weekStartDay ?? ''}
                onChange={(e) => setWeekStartDay(e.target.value ? Number(e.target.value) : null)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"
                disabled={!isManager}
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
                disabled={!isManager}
              >
                <option value="">선택</option>
                {DAYS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            {isManager && (
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={handleSaveSchedule}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  저장
                </button>
                {scheduleSaved && (
                  <span className="text-sm text-green-600 pb-2 animate-fade-in">저장되었습니다</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-medium text-gray-900 mb-3">태그 설정</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-2">주간 태그 {isManager && '(추가/수정/삭제)'}</p>
              {weeklyTags.map((t) => (
                <div key={t.tagId} className="flex gap-2 items-center mb-2">
                  <input
                    type="text"
                    value={t.tagName}
                    onChange={(e) => updateTag(t.tagId, { tagName: e.target.value })}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1 disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="태그명"
                    disabled={!isManager}
                  />
                  <select
                    value={t.parentTagId ?? ''}
                    onChange={(e) =>
                      updateTag(t.tagId, {
                        parentTagId: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm w-32 disabled:bg-gray-100 disabled:text-gray-500"
                    disabled={!isManager}
                  >
                    <option value="">부모(월간) 없음</option>
                    {monthlyTags.map((m) => (
                      <option key={m.tagId} value={m.tagId}>{m.tagName}</option>
                    ))}
                  </select>
                  {isManager && (
                    <button
                      type="button"
                      onClick={() => removeTag(t.tagId)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      삭제
                    </button>
                  )}
                </div>
              ))}
              {isManager && (
                <button
                  type="button"
                  onClick={addWeeklyTag}
                  className="text-sm text-blue-600 hover:underline"
                >
                  + 주간 태그 추가
                </button>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">월간 태그 {isManager && '(추가/수정/삭제)'}</p>
              {monthlyTags.map((t) => (
                <div key={t.tagId} className="flex gap-2 items-center mb-2">
                  <input
                    type="text"
                    value={t.tagName}
                    onChange={(e) => updateTag(t.tagId, { tagName: e.target.value })}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1 disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="태그명"
                    disabled={!isManager}
                  />
                  {isManager && (
                    <button
                      type="button"
                      onClick={() => removeTag(t.tagId)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      삭제
                    </button>
                  )}
                </div>
              ))}
              {isManager && (
                <button
                  type="button"
                  onClick={addMonthlyTag}
                  className="text-sm text-blue-600 hover:underline"
                >
                  + 월간 태그 추가
                </button>
              )}
            </div>
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
