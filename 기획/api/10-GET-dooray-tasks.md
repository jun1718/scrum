# GET /api/dooray/tasks

## 설명
두레이 업무 목록을 조회한다. BE가 Dooray API를 대리 호출하며, JWT의 dooray_api_token을 복호화하여 사용한다.

## 요청
- **Method**: GET
- **URL**: `/api/dooray/tasks`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| date | query | String | N | 조회 날짜 (yyyy-MM-dd) |

### Request Body
없음

## 응답

### 200 OK
```json
[
  {
    "taskId": "task-001",
    "taskTitle": "로그인 기능 구현",
    "taskLink": "https://dooray.com/project/task/task-001"
  },
  {
    "taskId": "task-002",
    "taskTitle": "API 설계 문서 작성",
    "taskLink": "https://dooray.com/project/task/task-002"
  }
]
```

### 에러
| 코드 | 설명 |
|------|------|
| - | - |

## 관련 페이지
- 데일리 슈크럼 작성 페이지
