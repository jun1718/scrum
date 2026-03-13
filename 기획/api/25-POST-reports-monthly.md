# POST /api/reports/monthly

## 설명
월간 보고를 수동 생성한다. 당월 1~25일 데일리를 태그별로 그룹핑하고 AI 요약(200자)을 생성한다.

## 요청
- **Method**: POST
- **URL**: `/api/reports/monthly`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
없음

### Request Body
```json
{}
```

## 응답

### 200 OK
```json
{
  "reportId": 1000000000020,
  "memberId": 9876543210001,
  "reportType": "MONTHLY",
  "staDate": "2026-03-01",
  "endDate": "2026-03-25"
}
```

### 에러
| 코드 | 설명 |
|------|------|
| - | - |

## 관련 페이지
- 월간 보고 페이지
