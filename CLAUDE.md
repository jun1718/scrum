# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**데일리 슈크럼 (SUPER scrum)** — 업무·성과 공유 자동화 서비스.

This repository is currently in the **planning phase**. It contains planning documents, database DDL, and AI-DLC workflow rules. No application source code exists yet.

## Planned Tech Stack

- **Backend**: Spring Boot, Java, MyBatis (not JPA), MySQL
- **Frontend**: React, TailwindCSS
- **Auth**: Dooray API token → JWT (custom filter, no Spring Security)
- **AI**: Claude API for report summarization (monthly/review reports)
- **PK Strategy**: BIGINT with TSID/Snowflake generation (time-series, non-predictable)

## Database Setup

```bash
# Execute MySQL DDL
mysql -u <user> -p <database> < ddl/ddl.sql
```

7 tables: `team`, `member`, `tag`, `report`, `report_detail`, `peer_report`, `report_tag`. All tables share common columns: `created_at`, `created_member_id`, `updated_at`, `updated_member_id`, `note`.

Schema reference: `기획/06-테이블-및-DDL참고.md`

## Architecture

### Report Generation Pipeline

```
Daily Scrum (user input) → Daily Report
  → [Batch @ 3AM on team's weekStartDay] → Weekly Report
  → [Batch @ 25th 5AM] → Monthly Report (with AI summary, 200 chars)
  → [User-triggered] → Review/Performance Report (with AI summary, 500 chars)
```

### Auth Flow

1. User provides Dooray API token
2. Backend verifies via `GET https://api.dooray.com/common/v1/members/me`
3. Backend creates/finds Member, returns JWT (claims: memberId, encrypted dooray_api_token)
4. Custom JWT filter validates subsequent requests (no Spring Security)

### Key Conventions

- One member belongs to one team (multi-team is future scope)
- `tag` hierarchy: `parent_tag_id = NULL` → monthly tag; with parent → weekly tag
- `report_tag` is a denormalized table caching tag-wise aggregations and AI summaries
- Batch jobs run one transaction per member to prevent partial failures
- Dooray API calls are proxied through the backend (WAS), not called directly from frontend

## Key Documents

| Path | Description |
|------|-------------|
| `기획/00-README.md` | Planning documents index |
| `기획/05-인증-참고.md` | Authentication flow design |
| `기획/07-보고-생성-프로세스.md` | Report generation process |
| `기획/08-사용자-행동별-기능정의.md` | Feature definitions by user action |
| `기획/11-API-후보-목록.md` | API endpoint candidates |
| `기획/12-에러-유효성-메시지.md` | Error/validation message catalog |
| `기획/13-ERD-논리검토-및-컬럼한글매핑.md` | ERD review and column mapping |
| `ddl/ddl.sql` | MySQL DDL (executable) |

## AI-DLC Workflow (필수)

개발 작업 수행 시 반드시 AI-DLC (AI-Driven Development Life Cycle) 워크플로우를 따른다.

### 규칙 로딩 순서

1. **워크플로우 규칙**: `.cursor/rules/ai-dlc-workflow.mdc` 읽고 전체 흐름 파악
2. **공통 규칙**: `.aidlc-rule-details/common/` 하위 전체 로드 (process-overview, session-continuity, content-validation, question-format-guide 등)
3. **단계별 규칙**: 현재 단계에 맞는 `.aidlc-rule-details/{phase}/` 로드
   - Inception: `inception/` (workspace-detection, requirements-analysis, user-stories, workflow-planning, application-design, units-generation)
   - Construction: `construction/` (functional-design, nfr-requirements, nfr-design, infrastructure-design, code-generation, build-and-test)
4. **보안 규칙**: `.aidlc-rule-details/extensions/security/baseline/security-baseline.md` — 15개 OWASP 기반 보안 규칙, 블로킹 제약조건으로 적용
5. **산출물**: `aidlc-docs/`에 저장, `aidlc-docs/audit.md`에 모든 상호작용 기록 (ISO 8601 타임스탬프, 원본 입력 그대로 기록, 절대 덮어쓰지 않고 append)

### 핵심 원칙

- 3단계 진행: Inception → Construction → Operations
- 각 단계 완료 시 사용자 승인 필수 (DO NOT PROCEED until user confirms)
- Construction은 유닛 단위 루프: 기능설계 → NFR요구 → NFR설계 → 인프라설계 → 코드생성
- 플랜 체크박스: 작업 완료 즉시 `[x]` 표기
- 콘텐츠 검증: 파일 생성 전 Mermaid 문법, ASCII 다이어그램, 특수문자 이스케이프 검증
- 질문 형식: A-E 객관식 + `[Answer]:` 태그
