# POST /api/reports/review

## 설명
성과 보고를 생성한다. performance가 있는 업무만 집계하며, AI 요약(500자)을 생성한다.

## 요청
- **Method**: POST
- **URL**: `/api/reports/review`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
없음

### Request Body
```json
{
  "staDate": "2026-01-01",
  "endDate": "2026-03-13"
}
```

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| staDate | body | String | O | 시작일 (yyyy-MM-dd) |
| endDate | body | String | O | 종료일 (yyyy-MM-dd) |

## 응답

### 200 OK
```json
{
  "reportId": 1000000000030,
  "memberId": 9876543210001,
  "reportType": "REVIEW",
  "staDate": "2026-01-01",
  "endDate": "2026-03-13"
}
```

### 에러
| 코드 | 설명 |
|------|------|
| 409 | 기간이 겹치는 성과 보고가 이미 존재함 |

## 관련 페이지
- 성과 보고 페이지
