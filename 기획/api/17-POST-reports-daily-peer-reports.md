# POST /api/reports/daily/peer-reports

## 설명
동료 협업 기록을 저장한다. 같은 날 같은 동료에 대한 중복 등록은 불가하다.

## 요청
- **Method**: POST
- **URL**: `/api/reports/daily/peer-reports`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
없음

### Request Body
```json
{
  "reportId": 1000000000001,
  "peerMemberId": 9876543210002,
  "content": "API 설계 리뷰 협업"
}
```

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| reportId | body | Long | O | 보고 ID |
| peerMemberId | body | Long | O | 동료 멤버 ID |
| content | body | String | O | 협업 내용 |

## 응답

### 200 OK
```json
{
  "peerReportId": 3000000000001,
  "reportId": 1000000000001,
  "peerMemberId": 9876543210002,
  "content": "API 설계 리뷰 협업"
}
```

### 에러
| 코드 | 설명 |
|------|------|
| 409 | 같은 날 같은 동료에 대한 중복 등록 |

## 관련 페이지
- 데일리 슈크럼 작성 페이지
