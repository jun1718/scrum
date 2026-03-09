# 데일리 슈크럼 (SUPER scrum)

업무·성과 공유 자동화 서비스. FE MVP(React + Vite) + 기획 문서 + DDL.

## 로컬 실행

```bash
npm install
npm run dev    # http://localhost:5173
npm run build  # dist/ 생성
npm run preview  # dist 로컬 미리보기
```

## 배포

### 1. Vercel (권장)

1. [vercel.com](https://vercel.com) 로그인 후 **Add New Project**.
2. GitHub/GitLab 등 저장소 연결 후 이 프로젝트 선택.
3. **Build Command**: `npm run build`  
   **Output Directory**: `dist`  
   (Vite 프로젝트라 보통 자동 인식됨)
4. **Deploy** 클릭.

- `vercel.json`이 있어 SPA 라우팅(`/team/assign` 등)이 그대로 동작합니다.
- 푸시할 때마다 자동 재배포하려면 저장소 연동만 하면 됩니다.

### 2. 수동 배포 (빌드 결과물만 올리기)

```bash
npm run build
```

- `dist/` 안의 파일 전체를 아무 정적 호스팅에 올리면 됩니다.
  - **Netlify**: 사이트 추가 → `dist` 폴더 드래그 또는 빌드 설정에 `npm run build`, publish 디렉터리 `dist`.
  - **GitHub Pages**: `dist` 내용을 gh-pages 브랜치나 `docs/`에 푸시 후 Pages 설정.
  - **AWS S3 / CloudFront**, **Firebase Hosting** 등도 동일하게 `dist`를 루트로 서빙.

SPA이므로 서버/호스팅에서 **모든 경로를 `index.html`로 보내는** 설정이 필요합니다. (Vercel은 `vercel.json`으로 이미 설정됨.)

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
