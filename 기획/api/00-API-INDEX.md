# REST API 목록

## 팀 (Teams)
- [POST /api/teams](01-POST-teams.md) — 팀 생성
- [DELETE /api/teams/{teamId}](02-DELETE-teams-teamId.md) — 팀 삭제
- [PUT /api/teams/{teamId}/schedule](03-PUT-teams-teamId-schedule.md) — 주간 보고 요일 설정
- [PUT /api/teams/{teamId}/tags](04-PUT-teams-teamId-tags.md) — 태그 일괄 저장
- [GET /api/teams](05-GET-teams.md) — 팀 목록 검색

## 멤버 (Members)
- [PUT /api/members/me/team](06-PUT-members-me-team.md) — 본인 팀 등록
- [GET /api/members](07-GET-members.md) — 멤버 검색
- [POST /api/members](08-POST-members.md) — 멤버 생성 + 팀 등록
- [PUT /api/members/{memberId}/team](09-PUT-members-memberId-team.md) — 멤버 팀 변경

## 두레이 (Dooray)
- [GET /api/dooray/tasks](10-GET-dooray-tasks.md) — 두레이 업무 목록 조회

## 데일리 보고 (Daily Reports)
- [GET /api/reports/daily](11-GET-reports-daily.md) — 데일리 보고 조회
- [POST /api/reports/daily](12-POST-reports-daily.md) — 데일리 저장
- [PUT /api/reports/daily/{reportId}](13-PUT-reports-daily-reportId.md) — 데일리 수정
- [DELETE /api/reports/daily/{reportId}](14-DELETE-reports-daily-reportId.md) — 데일리 삭제
- [DELETE /api/reports/daily/{reportId}/details/{detailId}](15-DELETE-reports-daily-reportId-details-detailId.md) — 데일리 상세 행 삭제

## 동료 협업 기록 (Peer Reports)
- [GET /api/reports/daily/peer-reports](16-GET-reports-daily-peer-reports.md) — 동료 협업 기록 조회
- [POST /api/reports/daily/peer-reports](17-POST-reports-daily-peer-reports.md) — 동료 협업 기록 저장
- [PUT /api/reports/daily/peer-reports/{peerReportId}](18-PUT-reports-daily-peer-reports-id.md) — 동료 협업 기록 수정
- [DELETE /api/reports/daily/peer-reports/{peerReportId}](19-DELETE-reports-daily-peer-reports-id.md) — 동료 협업 기록 삭제

## 주간 보고 (Weekly Reports)
- [GET /api/reports/weekly](20-GET-reports-weekly.md) — 주간 보고 목록 조회
- [POST /api/reports/weekly](21-POST-reports-weekly.md) — 주간 보고 수동 생성
- [PUT /api/reports/weekly/{reportId}](22-PUT-reports-weekly-reportId.md) — 주간 보고 수정
- [DELETE /api/reports/weekly/{reportId}](23-DELETE-reports-weekly-reportId.md) — 주간 보고 삭제

## 월간 보고 (Monthly Reports)
- [GET /api/reports/monthly](24-GET-reports-monthly.md) — 월간 보고 목록 조회
- [POST /api/reports/monthly](25-POST-reports-monthly.md) — 월간 보고 수동 생성
- [PUT /api/reports/monthly/{reportId}](26-PUT-reports-monthly-reportId.md) — 월간 보고 수정
- [DELETE /api/reports/monthly/{reportId}](27-DELETE-reports-monthly-reportId.md) — 월간 보고 삭제

## 성과 보고 (Review Reports)
- [GET /api/reports/review](28-GET-reports-review.md) — 성과 보고 목록 조회
- [POST /api/reports/review](29-POST-reports-review.md) — 성과 보고 생성
- [PUT /api/reports/review/{reportId}](30-PUT-reports-review-reportId.md) — 성과 보고 수정
- [DELETE /api/reports/review/{reportId}](31-DELETE-reports-review-reportId.md) — 성과 보고 삭제

## 팀 업무 공유 (Team Shared Reports)
- [GET /api/teams/{teamId}/reports/daily](32-GET-teams-teamId-reports-daily.md) — 팀 공유 데일리 조회
- [GET /api/teams/{teamId}/reports/weekly](33-GET-teams-teamId-reports-weekly.md) — 팀 공유 주간 조회
- [GET /api/teams/{teamId}/reports/monthly](34-GET-teams-teamId-reports-monthly.md) — 팀 공유 월간 조회
