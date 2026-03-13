# PUT /api/reports/daily/{reportId}

## 설명
데일리 보고를 수정한다.

## 요청
- **Method**: PUT
- **URL**: `/api/reports/daily/{reportId}`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| reportId | path | Long | O | 보고 ID |

### Request Body
```json
{
  "details": [
    {
      "reportDetailId": 2000000000001,
      "tagId": 1234567890002,
      "taskId": "task-001",
      "taskTitle": "로그인 기능 구현",
      "taskLink": "https://dooray.com/project/task/task-001",
      "done": true,
      "workHours": 5.0,
      "performance": "JWT 인증 구현 및 테스트 완료"
    }
  ]
}
```

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| details | body | Array | O | 보고 상세 목록 |
| details[].reportDetailId | body | Long | N | 기존 상세 ID (수정 시) |
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
| - | - |

## 관련 페이지
- 데일리 슈크럼 작성 페이지
- 데일리 보고 페이지
