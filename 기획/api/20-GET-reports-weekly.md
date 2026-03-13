# GET /api/reports/weekly

## 설명
주간 보고 목록을 조회한다.

## 요청
- **Method**: GET
- **URL**: `/api/reports/weekly`
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
    "reportId": 1000000000010,
    "memberId": 9876543210001,
    "reportType": "WEEKLY",
    "staDate": "2026-03-09",
    "endDate": "2026-03-15",
    "reportDetails": [
      {
        "reportDetailId": 2000000000010,
        "tagId": 1234567890002,
        "taskId": "task-001",
        "taskTitle": "로그인 기능 구현",
        "taskLink": "https://dooray.com/project/task/task-001",
        "done": true,
        "workHours": 20.0,
        "performance": "JWT 인증 구현 완료"
      }
    ],
    "reportTags": [
      {
        "reportTagId": 4000000000001,
        "tagId": 1234567890001,
        "tagName": "프로젝트A",
        "totalWorkHours": 30.0,
        "workRatio": 75.0
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
- 주간 보고 페이지
