# 13. ERD 논리 검토 및 컬럼 한글 매핑

## ERD 논리 검토·보강 요약

| 테이블 | 보강 내용 | 이유 |
|--------|-----------|------|
| team | **weekStartDay**, **weekEndDay** 추가 | 배치에서 "오늘이 주간 보고 시작일인 팀" 판단 |
| tag | **teamId** (FK → team) 추가 | 팀별 태그 조회 |
| member | **teamId** NULLABLE | 팀 미지정 시에도 회원 존재 가능 |

저장·조회 흐름(데일리 저장, 주간/월간 생성, 동료 기록, 팀 공유) 검토 후 논리적 일치 확인.

## 테이블·컬럼 한글명 매핑

- **team**: teamId(팀 ID), teamName(팀명), weekStartDay(주간 보고 시작 요일), weekEndDay(주간 보고 종료 요일).
- **member**: memberId(회원 ID), teamId(소속 팀 ID), doorayMemberId(두레이 회원 ID), memberName(회원명).
- **tag**: tagId(태그 ID), teamId(소속 팀 ID), parentTagId(부모 태그 ID), tagName(태그명), type(태그 타입).
- **report**: reportId(보고 ID), memberId(업무 진행자 ID), staDate(보고 시작일), endDate(보고 종료일), type(보고 유형).
- **reportDetail**: reportDetailId, reportId, tagId(태그 ID), done(해당 업무로 한 일), workHours(투입시간), performance(어필할 성과), taskTitle(업무 제목), taskLink(업무 링크), taskId.
- **peerReport**: peerReportId, reportId, peerMemberId(동료 회원 ID), content(동료 기록 내용).
- **reportTag**: reportTagId, reportId, tagId, workHours(투입시간), type, aiSummaryContent(AI 요약 내용).

**공통 컬럼 한글**: createdAt(생성 일시), createdMemberId(생성 회원 ID), updatedAt(수정 일시), updatedMemberId(수정 회원 ID), note(비고).

행동 흐름별 노출 구간은 08 각 절에 **(노출)** **(저장)** 로 표기.
