# GET /api/teams/{teamId}/reports/daily

## 설명
팀 공유용 데일리 보고를 조회한다. 민감정보(performance, peerReport)는 제외되며, 투입률(%)이 포함된다.

## 요청
- **Method**: GET
- **URL**: `/api/teams/{teamId}/reports/daily`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| teamId | path | Long | O | 팀 ID |
| date | query | String | N | 조회 날짜 (yyyy-MM-dd) |

### Request Body
없음

## 응답

### 200 OK
```json
[
  {
    "memberId": 9876543210001,
    "memberName": "홍길동",
    "reportId": 1000000000001,
    "staDate": "2026-03-13",
    "endDate": "2026-03-13",
    "reportDetails": [
      {
        "reportDetailId": 2000000000001,
        "tagId": 1234567890002,
        "tagName": "기능개발",
        "taskId": "task-001",
        "taskTitle": "로그인 기능 구현",
        "taskLink": "https://dooray.com/project/task/task-001",
        "done": true,
        "workHours": 4.0,
        "workRatio": 50.0
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
- 팀 업무 공유 데일리
