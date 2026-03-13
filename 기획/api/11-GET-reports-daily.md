# GET /api/reports/daily

## 설명
데일리 보고를 조회한다. 특정 날짜 또는 기간별로 조회할 수 있다.

## 요청
- **Method**: GET
- **URL**: `/api/reports/daily`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| date | query | String | N | 조회 날짜 (yyyy-MM-dd) |
| memberId | query | Long | N | 멤버 ID |
| from | query | String | N | 시작일 (yyyy-MM-dd) |
| to | query | String | N | 종료일 (yyyy-MM-dd) |

### Request Body
없음

## 응답

### 200 OK
```json
{
  "reportId": 1000000000001,
  "memberId": 9876543210001,
  "reportType": "DAILY",
  "staDate": "2026-03-13",
  "endDate": "2026-03-13",
  "reportDetails": [
    {
      "reportDetailId": 2000000000001,
      "tagId": 1234567890002,
      "taskId": "task-001",
      "taskTitle": "로그인 기능 구현",
      "taskLink": "https://dooray.com/project/task/task-001",
      "done": true,
      "workHours": 4.0,
      "performance": "JWT 인증 구현 완료"
    }
  ]
}
```

### 에러
| 코드 | 설명 |
|------|------|
| - | - |

## 관련 페이지
- 데일리 슈크럼 작성 페이지
- 데일리 보고 페이지
