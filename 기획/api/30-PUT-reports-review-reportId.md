# PUT /api/reports/review/{reportId}

## 설명
성과 보고를 수정한다.

## 요청
- **Method**: PUT
- **URL**: `/api/reports/review/{reportId}`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| reportId | path | Long | O | 보고 ID |

### Request Body
```json
{
  "reportDetailTags": [
    {
      "reportDetailTagId": 4000000000020,
      "tagId": 1234567890001,
      "aiSummary": "프로젝트A에서 백엔드 핵심 기능을 주도적으로 개발하고, 보고서 자동 생성 파이프라인을 구축하여 수작업 공수를 80% 절감함."
    }
  ]
}
```

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
| - | - |

## 관련 페이지
- 성과 보고 페이지
