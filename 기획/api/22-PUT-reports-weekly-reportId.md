# PUT /api/reports/weekly/{reportId}

## 설명
주간 보고를 수정한다.

## 요청
- **Method**: PUT
- **URL**: `/api/reports/weekly/{reportId}`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| reportId | path | Long | O | 보고 ID |

### Request Body
```json
{
  "reportDetails": [
    {
      "reportDetailId": 2000000000010,
      "tagId": 1234567890002,
      "taskId": "task-001",
      "taskTitle": "로그인 기능 구현",
      "taskLink": "https://dooray.com/project/task/task-001",
      "done": true,
      "workHours": 22.0,
      "performance": "JWT 인증 구현 및 테스트 완료"
    }
  ]
}
```

## 응답

### 200 OK
```json
{
  "reportId": 1000000000010,
  "memberId": 9876543210001,
  "reportType": "WEEKLY",
  "staDate": "2026-03-09",
  "endDate": "2026-03-15"
}
```

### 에러
| 코드 | 설명 |
|------|------|
| - | - |

## 관련 페이지
- 주간 보고 페이지
