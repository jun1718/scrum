# 20. UML 다이어그램 — 데일리 슈크럼(SUPER scrum)

> 전체 시스템 흐름을 한눈에 파악할 수 있도록 정리한 UML 문서입니다.
> 모든 다이어그램은 Mermaid 문법으로 작성되었습니다.

---

## 목차

1. [ERD (Entity Relationship Diagram)](#1-erd)
2. [유스케이스 다이어그램](#2-유스케이스-다이어그램)
3. [시스템 아키텍처 (컴포넌트 다이어그램)](#3-시스템-아키텍처)
4. [인증 시퀀스 다이어그램](#4-인증-플로우)
5. [데일리 스크럼 작성 시퀀스 다이어그램](#5-데일리-스크럼-작성-플로우)
6. [보고서 자동 생성 시퀀스 다이어그램 (배치)](#6-보고서-자동-생성-배치-플로우)
7. [AI 요약 생성 시퀀스 다이어그램](#7-ai-요약-생성-플로우)
8. [보고서 파이프라인 상태 다이어그램](#8-보고서-파이프라인-상태-다이어그램)
9. [페이지 네비게이션 플로우차트](#9-페이지-네비게이션-플로우차트)
10. [팀 공유 시퀀스 다이어그램](#10-팀-공유-플로우)

---

## 1. ERD

7개 테이블 간의 관계를 나타냅니다.

```mermaid
erDiagram
    team {
        BIGINT team_id PK
        VARCHAR team_name
        TINYINT week_start_day "0=일~6=토"
        TINYINT week_end_day
        DATETIME created_at
        BIGINT created_member_id FK
        DATETIME updated_at
        BIGINT updated_member_id
        VARCHAR note
    }

    member {
        BIGINT member_id PK
        BIGINT team_id FK "NULL 허용"
        VARCHAR dooray_member_id "Dooray 회원 ID"
        VARCHAR member_name
        DATETIME created_at
        BIGINT created_member_id
        DATETIME updated_at
        BIGINT updated_member_id
        VARCHAR note
    }

    tag {
        BIGINT tag_id PK
        BIGINT team_id FK
        BIGINT parent_tag_id FK "NULL=월간, 있으면=주간"
        VARCHAR tag_name
        VARCHAR type "weekly | monthly"
        DATETIME created_at
        BIGINT created_member_id
        DATETIME updated_at
        BIGINT updated_member_id
        VARCHAR note
    }

    report {
        BIGINT report_id PK
        BIGINT member_id FK
        DATE sta_date
        DATE end_date
        VARCHAR type "daily|weekly|monthly|review"
        DATETIME created_at
        BIGINT created_member_id
        DATETIME updated_at
        BIGINT updated_member_id
        VARCHAR note
    }

    report_detail {
        BIGINT report_detail_id PK
        BIGINT report_id FK
        BIGINT tag_id FK
        BIGINT task_id "UK: report_id+task_id"
        VARCHAR task_title
        VARCHAR task_link
        TEXT done
        DECIMAL work_hours
        TEXT performance "NULL 허용"
        DATETIME created_at
        BIGINT created_member_id
        DATETIME updated_at
        BIGINT updated_member_id
        VARCHAR note
    }

    peer_report {
        BIGINT peer_report_id PK
        BIGINT report_id FK "daily만"
        BIGINT peer_member_id FK "UK: report_id+peer_member_id"
        TEXT content
        DATETIME created_at
        BIGINT created_member_id
        DATETIME updated_at
        BIGINT updated_member_id
        VARCHAR note
    }

    report_tag {
        BIGINT report_tag_id PK
        BIGINT report_id FK
        BIGINT tag_id FK
        DECIMAL work_hours "태그별 합산"
        VARCHAR type "weekly|monthly|review"
        TEXT ai_summary_content "monthly,review만"
        DATETIME created_at
        BIGINT created_member_id
        DATETIME updated_at
        BIGINT updated_member_id
        VARCHAR note
    }

    team ||--o{ member : "1팀 = N멤버"
    team ||--o{ tag : "1팀 = N태그"
    tag ||--o| tag : "월간태그 → 주간태그 (parent)"
    member ||--o{ report : "1멤버 = N보고"
    report ||--o{ report_detail : "1보고 = N상세"
    report ||--o{ peer_report : "1보고 = N동료기록"
    report ||--o{ report_tag : "1보고 = N태그집계"
    tag ||--o{ report_detail : "1태그 = N상세"
    tag ||--o{ report_tag : "1태그 = N태그집계"
    member ||--o{ peer_report : "동료 참조"
```

---

## 2. 유스케이스 다이어그램

액터(팀장, 팀원, 배치, AI)별 기능을 정리합니다.

```mermaid
graph TB
    subgraph Actors
        TL["🧑‍💼 팀장"]
        TM["🧑‍💻 팀원 (공통)"]
        BATCH["⏰ 배치 스케줄러"]
        AI["🤖 Claude AI"]
    end

    subgraph "팀 관리"
        T1["T-1 팀 생성"]
        T2["T-2 주간 시작/종료 요일 설정"]
        T3["T-3 주간 태그 관리"]
        T4["T-4 월간 태그 관리"]
    end

    subgraph "팀 참여"
        T5["T-5 팀 검색"]
        T6["T-6 팀 배정 (본인)"]
    end

    subgraph "데일리 스크럼"
        D1["D-1 Dooray 업무 자동 로드"]
        D2["D-2 데일리 스크럼 저장"]
        D3["D-3 행 추가"]
        D4["D-4 행 삭제"]
        D5["D-5 주간 태그 선택 (필수)"]
        D6["D-6 데일리 스크럼 수정"]
        D7["D-7 데일리 스크럼 삭제"]
        D8["D-8 동료 협업 기록 저장"]
        D9["D-9 동료 협업 기록 수정/삭제"]
    end

    subgraph "보고서 조회/관리"
        R1["R-1 일간 보고 목록"]
        R2["R-2 주간 보고 목록"]
        R3["R-3 월간 보고 목록 + AI 요약"]
        R4["R-4 성과 보고 목록 + AI 요약"]
        R5["R-5 주간 보고 수정/삭제"]
        R6["R-6 월간 보고 수정/삭제/재생성"]
        R7["R-7 성과 보고 생성 (기간 지정)"]
        R8["R-8 성과 보고 수정/삭제"]
    end

    subgraph "팀 공유"
        S1["S-1 팀 일간 보고 조회"]
        S2["S-2 팀 주간 보고 조회"]
        S3["S-3 팀 월간 보고 조회"]
        S4["S-4 가동률 산출"]
    end

    subgraph "배치 / AI"
        B1["B-1 주간 보고 자동 생성 (매일 3AM)"]
        B2["B-2 월간 보고 자동 생성 (25일 5AM)"]
        A1["A-1 월간 AI 요약 (200자)"]
        A2["A-2 성과 AI 요약 (500자)"]
    end

    TL --> T1 & T2 & T3 & T4
    TM --> T5 & T6
    TM --> D1 & D2 & D3 & D4 & D5 & D6 & D7 & D8 & D9
    TM --> R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8
    TM --> S1 & S2 & S3 & S4
    BATCH --> B1 & B2
    AI --> A1 & A2
    B2 -.->|트리거| A1
    R7 -.->|트리거| A2
```

---

## 3. 시스템 아키텍처

```mermaid
graph TB
    subgraph "Frontend (React + TailwindCSS)"
        UI["SPA"]
        UI --> |JWT in Header| API_GW
    end

    subgraph "Backend (Spring Boot)"
        API_GW["REST API Layer"]

        subgraph "Controllers"
            AUTH_C["AuthController"]
            TEAM_C["TeamController"]
            REPORT_C["ReportController"]
            SHARE_C["TeamShareController"]
            DOORAY_C["DoorayProxyController"]
        end

        subgraph "Services"
            AUTH_S["AuthService"]
            TEAM_S["TeamService"]
            TAG_S["TagService"]
            REPORT_S["ReportService"]
            BATCH_S["BatchService"]
            AI_S["AISummaryService"]
            DOORAY_S["DoorayService"]
        end

        subgraph "Infrastructure"
            JWT_F["JWT 커스텀 필터"]
            MYBATIS["MyBatis Mapper"]
            SCHEDULER["Spring Scheduler"]
        end

        API_GW --> AUTH_C & TEAM_C & REPORT_C & SHARE_C & DOORAY_C
        AUTH_C --> AUTH_S
        TEAM_C --> TEAM_S & TAG_S
        REPORT_C --> REPORT_S
        SHARE_C --> REPORT_S
        DOORAY_C --> DOORAY_S
        REPORT_S --> AI_S
        SCHEDULER --> BATCH_S
        BATCH_S --> REPORT_S
        AUTH_S --> JWT_F
        REPORT_S & TEAM_S & TAG_S & AUTH_S --> MYBATIS
    end

    subgraph "External"
        DOORAY_API["Dooray API"]
        CLAUDE_API["Claude API"]
        MYSQL["MySQL DB"]
    end

    DOORAY_S --> DOORAY_API
    AI_S --> CLAUDE_API
    MYBATIS --> MYSQL
    AUTH_S --> DOORAY_API
```

---

## 4. 인증 플로우

```mermaid
sequenceDiagram
    actor User as 사용자
    participant FE as Frontend
    participant BE as Backend (AuthController)
    participant Dooray as Dooray API
    participant DB as MySQL

    User->>FE: Dooray API 토큰 입력
    FE->>BE: POST /login {doorayApiToken}

    BE->>Dooray: GET /common/v1/members/me<br/>Header: Authorization: dooray-api {token}
    Dooray-->>BE: 200 OK {id, name, userCode, email}

    alt 신규 사용자
        BE->>DB: SELECT member WHERE dooray_member_id = {id}
        DB-->>BE: 없음
        BE->>DB: INSERT member (doorayMemberId, memberName)
        DB-->>BE: OK
    else 기존 사용자
        BE->>DB: SELECT member WHERE dooray_member_id = {id}
        DB-->>BE: Member 정보 반환
    end

    BE->>BE: JWT 생성<br/>claims: {memberId, encryptedDoorayToken}
    BE-->>FE: 200 OK {jwt, memberInfo}

    FE->>FE: JWT 저장 (localStorage 등)

    Note over FE,BE: 이후 모든 요청

    FE->>BE: API 요청<br/>Header: Authorization: Bearer {jwt}
    BE->>BE: JWT 커스텀 필터 검증
    alt 유효한 토큰
        BE-->>FE: 정상 응답
    else 만료/무효
        BE-->>FE: 401 Unauthorized
    end
```

---

## 5. 데일리 스크럼 작성 플로우

```mermaid
sequenceDiagram
    actor User as 사용자
    participant FE as Frontend (메인 페이지)
    participant BE as Backend
    participant Dooray as Dooray API
    participant DB as MySQL

    User->>FE: 데일리 스크럼 탭 클릭

    FE->>BE: GET /dooray/tasks (멘션, 댓글, 담당)
    BE->>BE: JWT에서 doorayToken 복호화
    BE->>Dooray: GET /project/v1/tasks (필터: 멘션/댓글/담당)
    Dooray-->>BE: 업무 목록
    BE-->>FE: 가공된 업무 목록

    FE->>FE: 업무 목록 테이블 렌더링

    loop 각 업무 행 입력
        User->>FE: done(한 일) 입력 [필수]
        User->>FE: workHours(투입 시간) 입력
        User->>FE: performance(성과) 입력 [선택]
        User->>FE: 주간 태그 선택 [필수]
        FE->>FE: 월간 태그 자동 매핑 (parentTagId 기반)
    end

    opt 수동 행 추가
        User->>FE: + 버튼 클릭
        FE->>FE: 빈 행 추가
        User->>FE: taskTitle, taskLink 직접 입력
    end

    opt 동료 협업 기록
        User->>FE: 동료 협업 버튼 클릭
        FE->>FE: 팀원 목록 표시
        User->>FE: 팀원 선택 + 내용 입력
    end

    User->>FE: 저장 버튼 클릭

    FE->>BE: POST /reports/daily<br/>{staDate, endDate, reportDetails[], peerReports[]}

    BE->>DB: INSERT report (type='daily')
    BE->>DB: INSERT report_detail × N (UNIQUE check: reportId+taskId)
    opt 동료 기록 있으면
        BE->>DB: INSERT peer_report × N (UNIQUE check: reportId+peerMemberId)
    end
    DB-->>BE: OK

    BE-->>FE: 201 Created {reportId}
    FE-->>User: 저장 완료 표시
```

---

## 6. 보고서 자동 생성 (배치) 플로우

### 6-1. 주간 보고 자동 생성 (매일 새벽 3시)

```mermaid
sequenceDiagram
    participant Scheduler as Spring Scheduler<br/>(매일 3:00 AM)
    participant Batch as BatchService
    participant Report as ReportService
    participant DB as MySQL

    Scheduler->>Batch: triggerWeeklyGeneration()

    Batch->>DB: SELECT DISTINCT team<br/>WHERE weekStartDay = 오늘 요일
    DB-->>Batch: 대상 팀 목록

    loop 각 팀
        Batch->>DB: SELECT member WHERE teamId = {팀}
        DB-->>Batch: 팀원 목록

        loop 각 팀원 (개별 트랜잭션)
            Batch->>DB: SELECT report + report_detail<br/>WHERE memberId = {멤버}<br/>AND type = 'daily'<br/>AND staDate BETWEEN {지난주간 시작~종료}
            DB-->>Batch: 일간 보고 상세 목록

            Batch->>Batch: 태그별 그룹핑
            Batch->>Batch: done 합치기 (줄바꿈 구분)
            Batch->>Batch: workHours 합산
            Batch->>Batch: performance 합치기
            Batch->>Batch: 중복 업무 항목 제거

            Batch->>DB: INSERT report (type='weekly')
            Batch->>DB: INSERT report_detail × N (집계된 상세)
            Batch->>DB: INSERT report_tag × N (태그별 workHours 합산)
            DB-->>Batch: OK
        end
    end

    Note over Scheduler,DB: 팀원 단위 개별 트랜잭션<br/>→ 한 명 실패해도 나머지 정상 처리
```

### 6-2. 월간 보고 자동 생성 (매월 25일 새벽 5시)

```mermaid
sequenceDiagram
    participant Scheduler as Spring Scheduler<br/>(매월 25일 5:00 AM)
    participant Batch as BatchService
    participant Report as ReportService
    participant AI as AISummaryService
    participant Claude as Claude API
    participant DB as MySQL

    Scheduler->>Batch: triggerMonthlyGeneration()

    Batch->>DB: SELECT ALL members (팀 배정된)
    DB-->>Batch: 전체 팀원 목록

    loop 각 팀원 (개별 트랜잭션)
        Batch->>DB: SELECT report + report_detail<br/>WHERE memberId = {멤버}<br/>AND type = 'daily'<br/>AND staDate BETWEEN 1일~25일
        DB-->>Batch: 일간 보고 상세 목록

        Batch->>Batch: 태그별 그룹핑 + 집계

        Batch->>DB: INSERT report (type='monthly')
        Batch->>DB: INSERT report_detail × N
        Batch->>DB: INSERT report_tag × N

        loop 각 태그
            Batch->>AI: 요약 요청 (done, workHours, performance, taskTitle)
            AI->>Claude: API 호출 (프롬프트: ~200자 요약)
            Claude-->>AI: 요약 텍스트
            AI-->>Batch: AI 요약 결과
            Batch->>DB: UPDATE report_tag SET ai_summary_content = {요약}
        end

        DB-->>Batch: OK
    end
```

---

## 7. AI 요약 생성 플로우

```mermaid
sequenceDiagram
    actor User as 사용자
    participant FE as Frontend
    participant BE as Backend
    participant AI as AISummaryService
    participant Claude as Claude API
    participant DB as MySQL

    Note over User,DB: 성과 보고 생성 (사용자 트리거)

    User->>FE: 성과 보고 생성 클릭<br/>(기간: staDate ~ endDate)
    FE->>BE: POST /reports/review {staDate, endDate}

    BE->>DB: SELECT report WHERE type='review'<br/>AND 기간 겹침 확인
    DB-->>BE: 겹침 없음

    BE->>DB: SELECT report_detail<br/>WHERE memberId AND type='daily'<br/>AND staDate BETWEEN {범위}
    DB-->>BE: 일간 보고 상세

    BE->>BE: 태그별 그룹핑 + 집계<br/>(performance만 추출)

    BE->>DB: INSERT report (type='review')
    BE->>DB: INSERT report_detail × N
    BE->>DB: INSERT report_tag × N

    loop 각 태그별
        BE->>AI: 요약 요청 (performance 중심)
        AI->>Claude: API 호출<br/>(프롬프트: 성과 중심 ~500자 요약)
        Claude-->>AI: 요약 텍스트
        AI-->>BE: AI 요약 결과
        BE->>DB: UPDATE report_tag<br/>SET ai_summary_content = {요약}
    end

    DB-->>BE: OK
    BE-->>FE: 201 Created {reportId}
    FE-->>User: 성과 보고 생성 완료
```

---

## 8. 보고서 파이프라인 상태 다이어그램

일간 → 주간 → 월간 → 성과 보고로 이어지는 데이터 흐름의 상태를 나타냅니다.

```mermaid
stateDiagram-v2
    [*] --> DoorayTask: Dooray 업무 로드

    DoorayTask --> DailyReport: 사용자 입력\n(done, workHours, performance, tag)

    DailyReport --> DailyReport: 수정/삭제 가능

    DailyReport --> WeeklyReport: 배치 (매일 3AM)\nweekStartDay 해당 팀만

    DailyReport --> MonthlyReport: 배치 (25일 5AM)\n1일~25일 집계

    DailyReport --> ReviewReport: 사용자 트리거\n기간 지정

    state WeeklyReport {
        [*] --> 태그별그룹핑_W
        태그별그룹핑_W --> done합치기_W: 줄바꿈 구분
        done합치기_W --> workHours합산_W
        workHours합산_W --> 중복제거_W
        중복제거_W --> report_tag생성_W
        report_tag생성_W --> [*]
    }

    state MonthlyReport {
        [*] --> 태그별그룹핑_M
        태그별그룹핑_M --> done합치기_M
        done합치기_M --> workHours합산_M
        workHours합산_M --> 중복제거_M
        중복제거_M --> report_tag생성_M
        report_tag생성_M --> AI요약_200자
        AI요약_200자 --> [*]
    }

    state ReviewReport {
        [*] --> 기간겹침검증
        기간겹침검증 --> 태그별그룹핑_R
        태그별그룹핑_R --> performance추출
        performance추출 --> report_tag생성_R
        report_tag생성_R --> AI요약_500자
        AI요약_500자 --> [*]
    }

    WeeklyReport --> 수정가능_W: 사용자 편집
    MonthlyReport --> 수정가능_M: 사용자 편집
    ReviewReport --> 수정가능_R: 사용자 편집

    수정가능_W --> [*]
    수정가능_M --> [*]
    수정가능_R --> [*]
```

---

## 9. 페이지 네비게이션 플로우차트

10개 페이지 간의 이동 흐름과 조건 분기를 나타냅니다.

```mermaid
flowchart TD
    START(["사용자 접속"]) --> LOGIN["POST /login\nDooray 토큰 입력"]
    LOGIN --> CHECK_TEAM{"팀 배정 여부?"}

    CHECK_TEAM -->|미배정| PAGE2["📋 팀 배정 페이지\n/team/assign\n- 팀 검색 (T-5)\n- 팀 배정 (T-6)"]
    PAGE2 --> MAIN

    CHECK_TEAM -->|배정됨| MAIN

    MAIN["🏠 메인 (데일리 스크럼)\n/ \n- Dooray 업무 로드 (D-1)\n- 스크럼 저장 (D-2)\n- 행 추가/삭제 (D-3,4)\n- 태그 선택 (D-5)\n- 동료 기록 (D-8,9)"]

    subgraph LEFT_MENU["좌측 메뉴"]
        TEAM_MGMT["⚙️ 팀 관리\n/team/manage"]
        MY_REPORT["📊 내 보고서"]
        TEAM_SHARE["👥 팀 공유"]
    end

    MAIN --> LEFT_MENU

    TEAM_MGMT --> PAGE1["팀 관리 페이지\n- 팀 생성 (T-1)\n- 일정 설정 (T-2)\n- 태그 관리 (T-3,4)"]

    MY_REPORT --> TAB_GROUP

    subgraph TAB_GROUP["내 보고서 탭"]
        TAB1["📝 데일리 스크럼 작성\n(기본 탭)"]
        TAB2["📋 일간 보고\n/reports/daily\n- 목록 (R-1)\n- 수정 (D-6)\n- 삭제 (D-7)"]
        TAB3["📅 주간 보고\n/reports/weekly\n- 목록 (R-2)\n- 수정/삭제 (R-5)\n- 자동+수동 생성"]
        TAB4["📊 월간 보고 (GRM)\n/reports/monthly\n- 목록 (R-3)\n- 수정/삭제/재생성 (R-6)\n- AI 요약 200자 (A-1)"]
        TAB5["🏆 성과 보고\n/reports/review\n- 목록 (R-4)\n- 생성 (R-7, 기간 지정)\n- 수정/삭제 (R-8)\n- AI 요약 500자 (A-2)"]
    end

    TAB1 --> MAIN

    TEAM_SHARE --> SHARE_TABS

    subgraph SHARE_TABS["팀 공유 탭"]
        SHARE_D["👥 팀 일간 (S-1)\n/team/share/daily"]
        SHARE_W["👥 팀 주간 (S-2)\n/team/share/weekly"]
        SHARE_M["👥 팀 월간 (S-3)\n/team/share/monthly"]
    end

    SHARE_D & SHARE_W & SHARE_M --> UTIL["가동률 산출 (S-4)\nworkHours / 일총시간 × 100"]

    style MAIN fill:#e1f5fe
    style LOGIN fill:#fff9c4
    style PAGE2 fill:#fff9c4
    style UTIL fill:#f3e5f5
```

---

## 10. 팀 공유 플로우

팀원 보고서 조회 시 민감 정보 필터링 처리를 나타냅니다.

```mermaid
sequenceDiagram
    actor User as 팀원
    participant FE as Frontend (팀 공유 탭)
    participant BE as Backend (TeamShareController)
    participant DB as MySQL

    User->>FE: 팀 공유 탭 클릭 (일간/주간/월간)
    FE->>BE: GET /teams/{teamId}/reports/{type}?date={date}

    BE->>BE: JWT에서 memberId, teamId 추출

    BE->>DB: SELECT report + report_detail<br/>WHERE team.teamId = {팀}<br/>AND report.type = {type}<br/>AND staDate = {date}
    DB-->>BE: 팀원 보고 목록

    BE->>BE: 민감 정보 필터링
    Note right of BE: ❌ performance 제외<br/>❌ peer_report 제외<br/>✅ done, workHours, tag 포함

    BE->>BE: 가동률 산출
    Note right of BE: utilization =<br/>workHours / 일총시간 × 100

    BE-->>FE: 필터링된 보고 목록<br/>+ 가동률(%)

    FE->>FE: 팀원별 보고서 렌더링
    FE-->>User: 팀 보고 화면 표시<br/>(민감 정보 미포함)
```

---

## 부록: 태그 계층 구조

```mermaid
graph TD
    subgraph "팀 A의 태그 구조"
        M1["🏷️ 월간 태그: 프로젝트 A\n(parentTagId = NULL, type='monthly')"]
        M2["🏷️ 월간 태그: 프로젝트 B\n(parentTagId = NULL, type='monthly')"]

        W1["📌 주간 태그: 기능개발\n(parentTagId = M1, type='weekly')"]
        W2["📌 주간 태그: 버그수정\n(parentTagId = M1, type='weekly')"]
        W3["📌 주간 태그: 설계\n(parentTagId = M2, type='weekly')"]
        W4["📌 주간 태그: 테스트\n(parentTagId = M2, type='weekly')"]

        M1 --> W1
        M1 --> W2
        M2 --> W3
        M2 --> W4
    end

    subgraph "데일리 스크럼 입력 시"
        INPUT["사용자가 주간 태그 선택 (필수)"]
        AUTO["→ 월간 태그 자동 매핑\n(parentTagId 기반)"]
        INPUT --> AUTO
    end

    W1 -.-> INPUT
    W2 -.-> INPUT
    W3 -.-> INPUT
    W4 -.-> INPUT
```

---

## 다이어그램 요약

| # | 다이어그램 | 설명 | 핵심 포인트 |
|---|-----------|------|------------|
| 1 | ERD | 7개 테이블 관계도 | tag 계층, report 타입 분류, UNIQUE 제약 |
| 2 | 유스케이스 | 액터별 31개 기능 | 팀장 vs 팀원 vs 배치 vs AI 역할 분리 |
| 3 | 시스템 아키텍처 | 컴포넌트 구성도 | No Spring Security, MyBatis, Dooray 프록시 |
| 4 | 인증 시퀀스 | 로그인 플로우 | Dooray 토큰 → JWT 발급 → 커스텀 필터 |
| 5 | 데일리 작성 시퀀스 | 메인 기능 플로우 | Dooray 로드 → 입력 → 저장 (report+detail+peer) |
| 6 | 배치 시퀀스 | 주간/월간 자동 생성 | 팀원 단위 개별 트랜잭션, 태그별 집계 |
| 7 | AI 요약 시퀀스 | 성과 보고 AI 생성 | 기간 겹침 검증, 태그별 500자 요약 |
| 8 | 상태 다이어그램 | 보고서 파이프라인 | daily → weekly/monthly/review 데이터 흐름 |
| 9 | 페이지 네비게이션 | 10개 페이지 이동 흐름 | 팀 미배정 분기, 탭 구조, 기능 매핑 |
| 10 | 팀 공유 시퀀스 | 민감 정보 필터링 | performance/peer 제외, 가동률 산출 |
