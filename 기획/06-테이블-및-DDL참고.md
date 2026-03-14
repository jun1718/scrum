# 6. 테이블 및 DDL 참고

- **실행용 DDL**: 프로젝트 루트의 **`ddl/ddl.sql`** (MySQL). 아래는 테이블·컬럼 정의 참고용.

## PK 공통

- **bigint**, TSID/Snowflake 라이브러리로 시계열·예측 어려운 값 사용. 단일 노드 중복 방지.

## 모든 테이블 공통 컬럼

- NOT NULL: **createdAt**, **createdMemberId**
- NULLABLE: **updatedAt**, **updatedMemberId**, **note**

---

## team

| 컬럼 | 설명 |
|------|------|
| teamId | PK |
| teamName | 팀명 |
| weekStartDay | 주간 보고 시작 요일 |
| weekEndDay | 주간 보고 종료 요일 |

---

## member

- **memberId** (PK), **teamId** (FK → team, NULLABLE), **doorayMemberId** (NOT BLANK, Dooray id), **memberName** (NOT BLANK), **managerYn** (관리자 여부, Y/N, NOT NULL DEFAULT 'N') + 공통 컬럼.
- 로그인·Member 조회/생성은 05 인증 참고. memberLoginId/memberPassword 없음.

---

## tag

- **tagId** (PK), **teamId** (FK → team, NOT NULL), **parentTagId** (부모 태그 ID, nullable → 없으면 monthly, 있으면 weekly), **tagName**, **type** (weekly | monthly).

---

## report

- **데일리 보고** = `type = 'daily'`인 report 1건 + 그 reportId에 속한 **reportDetail** 목록.
- **주간/월간/성과** 보고 = 각각 type이 weekly, monthly, review인 report + reportDetail.

| 컬럼 | 설명 |
|------|------|
| reportId | PK |
| memberId | FK → member |
| staDate, endDate | NOT BLANK |
| type | **daily** \| weekly \| monthly \| review (NOT BLANK) |
| tomorrowPlan | 내일 할 일 (daily 전용, Nullable) |

---

## reportDetail

- UNIQUE: (reportId, taskId). 당일 같은 업무 2건 이상 불가.

| 컬럼 | 설명 |
|------|------|
| reportDetailId | PK |
| reportId | FK → report |
| tagId | FK → tag (주/월간 보고 태그) |
| done | 오늘 한 일 (NOT BLANK) |
| workHours | 투입시간 (NOT BLANK) |
| performance | 어필할 성과 (Nullable) |
| taskTitle, taskLink, taskId | NOT BLANK. taskLink 형식: /project/tasks/[0-9]+ |

---

## peerReport

- report.type == 'daily' 일일 데이터에 입력. 성과 보고 생성 시 사용.

| 컬럼 | 설명 |
|------|------|
| peerReportId | PK |
| reportId | FK → report |
| peerMemberId | FK → member |
| content | 동료 기록 (Nullable) |

---

## report_detail_tag

- **성과보고(review) 전용** 태그별 반정규화(캐싱) 테이블. 성과 보고 생성 시 태그 내 모든 reportDetail의 aiSummary + performance를 Claude API로 요약 → 태그별 **aiSummary**(500자 내외) 및 **workHours**(태그별 투입시간) 캐싱 저장.
- **reportId**는 성과보고용으로 **새로 생성한 report**를 가리킴(기존 데일리 reportId 재사용 아님).
- **type**: `review` 전용 (주간/월간의 태그별 workHours는 조회 시 SUM 계산하므로 캐싱 안 함).
- 컬럼: **report_detail_tag_id** (PK), **report_id** (FK → report), **tag_id** (FK → tag), **work_hours**, **type** (review), **ai_summary** (성과보고 태그별 AI 요약 결과).

---

## 두레이 업무 목록 조회

- 데일리 슈크럼 작성 화면용. WAS가 Dooray API 대신 호출. 당일 "내가 멘션된 업무", "내가 쓴 댓글", "등록자/담당자/참조자이면서 수정된 업무" 등. API 경로·파라미터는 Dooray 문서 확인 예정.
