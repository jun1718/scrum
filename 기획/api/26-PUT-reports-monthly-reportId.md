# PUT /api/reports/monthly/{reportId}

## 설명
월간 보고를 수정한다.

## 요청
- **Method**: PUT
- **URL**: `/api/reports/monthly/{reportId}`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| reportId | path | Long | O | 보고 ID |

### Request Body
```json
{
  "reportTags": [
    {
      "reportTagId": 4000000000010,
      "tagId": 1234567890001,
      "aiSummaryContent": "프로젝트A에서 JWT 인증 및 API 설계를 완료하고, 코드 리뷰를 통해 품질을 개선함."
    }
  ]
}
```

## 응답

### 200 OK
```json
{
  "reportId": 1000000000020,
  "memberId": 9876543210001,
  "reportType": "MONTHLY",
  "staDate": "2026-03-01",
  "endDate": "2026-03-25"
}
```

### 에러
| 코드 | 설명 |
|------|------|
| - | - |

## 관련 페이지
- 월간 보고 페이지
