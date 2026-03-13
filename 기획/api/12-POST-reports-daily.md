# POST /api/reports/daily

## 설명
데일리 보고를 저장한다. 당일 기존 데이터가 있으면 덮어쓰기한다.

## 요청
- **Method**: POST
- **URL**: `/api/reports/daily`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
없음

### Request Body
```json
{
  "staDate": "2026-03-13",
  "endDate": "2026-03-13",
  "details": [
    {
      "tagId": 1234567890002,
      "taskId": "task-001",
      "taskTitle": "로그인 기능 구현",
      "taskLink": "https://dooray.com/project/task/task-001",
      "done": true,
      "workHours": 4.0,
      "performance": "JWT 인증 구현 완료"
    },
    {
      "tagId": 1234567890003,
      "taskId": "task-002",
      "taskTitle": "버그 수정",
      "taskLink": "https://dooray.com/project/task/task-002",
      "done": false,
      "workHours": 3.5,
      "performance": ""
    }
  ]
}
```

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| staDate | body | String | O | 시작일 (yyyy-MM-dd) |
| endDate | body | String | O | 종료일 (yyyy-MM-dd) |
| details | body | Array | O | 보고 상세 목록 |
| details[].tagId | body | Long | O | 태그 ID |
| details[].taskId | body | String | N | 두레이 업무 ID |
| details[].taskTitle | body | String | O | 업무 제목 |
| details[].taskLink | body | String | N | 두레이 업무 링크 |
| details[].done | body | Boolean | O | 완료 여부 |
| details[].workHours | body | Double | O | 투입 시간 |
| details[].performance | body | String | N | 성과 내용 |

## 응답

### 200 OK
```json
{
  "reportId": 1000000000001,
  "memberId": 9876543210001,
  "reportType": "DAILY",
  "staDate": "2026-03-13",
  "endDate": "2026-03-13"
}
```

### 에러
| 코드 | 설명 |
|------|------|
| 400 | 팀 설정 미완료 |
| 400 | 필수값 누락 |

## 관련 페이지
- 데일리 슈크럼 작성 페이지
