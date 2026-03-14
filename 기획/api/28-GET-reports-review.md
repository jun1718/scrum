# GET /api/reports/review

## 설명
성과 보고 목록을 조회한다. 응답에 reportDetailTag.aiSummary가 포함된다.

## 요청
- **Method**: GET
- **URL**: `/api/reports/review`
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
    "reportId": 1000000000030,
    "memberId": 9876543210001,
    "reportType": "REVIEW",
    "staDate": "2026-01-01",
    "endDate": "2026-03-13",
    "reportDetailTags": [
      {
        "reportDetailTagId": 4000000000020,
        "tagId": 1234567890001,
        "tagName": "프로젝트A",
        "totalWorkHours": 350.0,
        "workRatio": 55.0,
        "aiSummary": "프로젝트A에서 백엔드 핵심 기능(JWT 인증, API 설계, 배치 처리)을 주도적으로 개발하고, 코드 리뷰를 통해 팀 전체 코드 품질 향상에 기여함. 특히 보고서 자동 생성 파이프라인 구축으로 수작업 공수를 80% 절감하는 성과를 달성함."
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
- 성과 보고 페이지
