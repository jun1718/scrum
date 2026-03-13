# GET /api/reports/monthly

## 설명
월간 보고 목록을 조회한다. 응답에 reportTag.aiSummaryContent가 포함된다.

## 요청
- **Method**: GET
- **URL**: `/api/reports/monthly`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| memberId | query | Long | N | 멤버 ID |
| from | query | String | N | 시작일 (yyyy-MM-dd) |
| to | query | String | N | 종료일 (yyyy-MM-dd) |

### Request Body
없음

## 응답

### 200 OK
```json
[
  {
    "reportId": 1000000000020,
    "memberId": 9876543210001,
    "reportType": "MONTHLY",
    "staDate": "2026-03-01",
    "endDate": "2026-03-25",
    "reportTags": [
      {
        "reportTagId": 4000000000010,
        "tagId": 1234567890001,
        "tagName": "프로젝트A",
        "totalWorkHours": 120.0,
        "workRatio": 60.0,
        "aiSummaryContent": "프로젝트A에서 JWT 인증 구현, API 설계 및 코드 리뷰를 수행하여 백엔드 핵심 기능 개발을 완료함."
      }
    ]
  }
]
```

### 에러
| 코드 | 설명 |
|------|------|
| - | - |

## 관련 페이지
- 월간 보고 페이지
