# 11. API 후보 목록 (행동별 매핑)

> 08 사용자 행동별 기능에 대응하는 BE API 후보. 경로·메서드는 구현 시 확정.

| 행동(기능) | HTTP | 경로 후보 | 비고 |
|------------|------|-----------|------|
| 로그인 | POST | `/login` | 두레이 토큰 전달, JWT 반환 (05 참고) |
| 팀 생성 | POST | `/teams` | 팀명 |
| 팀 시작/종료일자 설정 | PUT/PATCH | `/teams/{teamId}/schedule` | 주간 시작·종료 요일 |
| 태그 설정(주간/월간) | POST | `/teams/{teamId}/tags` | 주간 태그 + 월간 그룹핑 |
| 팀 목록 검색 | GET | `/teams?q=` | 팀 지정 팝업용 |
| 팀 지정(자신 배정) | POST | `/members/me/team` 또는 PUT `/members/me` | teamId. Member 생성·팀 배정 |
| 데일리 업무 목록 조회(두레이) | GET | (WAS가 두레이 API 대신 호출) | 06 두레이 업무 조회 참고 |
| 데일리 스크럼 저장 | POST | `/reports/daily` 또는 `/daily-scrum` | report(daily) + reportDetail + peerReport |
| 데일리 스크럼 수정/삭제 | PUT, DELETE | `/reports/daily/{reportId}` 등 | 주간보고 생성 전까지 |
| 동료 협업 기록 | POST, PUT, DELETE | `/reports/daily/{reportId}/peer-reports` 등 | peerReport |
| 데일리/주간/월간/성과 보고 목록 | GET | `/reports/daily?memberId=&from=&to=` 등 | |
| 성과 보고 생성(버튼) | POST | `/reports/review` | body에 시작일·종료일. 기간 중복 시 400 |
| 보고 수정/삭제/재생성 | PUT, DELETE, POST | `/reports/{type}/{reportId}` 등 | |
| 팀 업무 공유 — 데일리/주간/월간 | GET | `/teams/{teamId}/reports/daily?date=` 등 | 팀원 목록·투입률. 민감정보 제외 |

- 인증: 05 참고. 요청 시 JWT(Authorization Header 등) 전달.
- 배치(주간/월간 생성)는 스케줄러·내부 호출로 처리.
