# PUT /api/reports/daily/peer-reports/{peerReportId}

## 설명
동료 협업 기록을 수정한다.

## 요청
- **Method**: PUT
- **URL**: `/api/reports/daily/peer-reports/{peerReportId}`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| peerReportId | path | Long | O | 동료 협업 기록 ID |

### Request Body
```json
{
  "content": "API 설계 리뷰 및 코드 리뷰 협업"
}
```

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| content | body | String | O | 협업 내용 |

## 응답

### 200 OK
```json
{
  "peerReportId": 3000000000001,
  "reportId": 1000000000001,
  "peerMemberId": 9876543210002,
  "content": "API 설계 리뷰 및 코드 리뷰 협업"
}
```

### 에러
| 코드 | 설명 |
|------|------|
| - | - |

## 관련 페이지
- 데일리 슈크럼 작성 페이지
