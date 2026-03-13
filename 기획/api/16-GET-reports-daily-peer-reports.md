# GET /api/reports/daily/peer-reports

## 설명
동료 협업 기록을 조회한다. 해당 일자의 동료 협업 내역을 반환한다.

## 요청
- **Method**: GET
- **URL**: `/api/reports/daily/peer-reports`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| date | query | String | O | 조회 날짜 (yyyy-MM-dd) |

### Request Body
없음

## 응답

### 200 OK
```json
[
  {
    "peerReportId": 3000000000001,
    "reportId": 1000000000001,
    "peerMemberId": 9876543210002,
    "content": "API 설계 리뷰 협업"
  }
]
```

### 에러
| 코드 | 설명 |
|------|------|
| - | - |

## 관련 페이지
- 데일리 슈크럼 작성 페이지
