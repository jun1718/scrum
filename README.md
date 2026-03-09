# 데일리 슈크럼 (SUPER scrum)

업무·성과 공유 자동화 서비스. 기획 문서와 DDL만 두는 저장소.

## 폴더 구조

| 경로 | 설명 |
|------|------|
| **기획/** | AI 스프린톤 참가·기획 문서 (00~15). 목차는 `기획/00-README.md` 참고. |
| **ddl/** | MySQL 실행용 DDL. `ddl/ddl.sql` — 테이블 정의는 `기획/06-테이블-및-DDL참고.md` 참고. |
| **.cursor/rules/** | Cursor AI-DLC 워크플로우 규칙 (`ai-dlc-workflow.mdc`). |
| **.aidlc-rule-details/** | AI-DLC 단계별 상세 규칙 (Inception, Construction, Operations 등). |
| **aidlc-docs/** | AI-DLC 실행 시 산출물(audit, state 등) 저장. |

## 사용 방법

- **기획 검토**: `기획/00-README.md` → 해당 번호 문서 참고.
- **DB 구축**: `ddl/ddl.sql` 실행 (MySQL). PK는 TSID/Snowflake 등으로 생성.
- **AI-DLC**: Cursor에서 이 프로젝트 열고 채팅 시 "Using AI-DLC, ..." 로 요청하면 워크플로우 적용.
