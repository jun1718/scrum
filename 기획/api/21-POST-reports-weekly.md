# POST /api/reports/weekly

## 설명
주간 보고를 수동 생성한다. 전주 데일리 보고를 태그별로 그룹핑하여 합산한다.

## 요청
- **Method**: POST
- **URL**: `/api/reports/weekly`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
없음

### Request Body
```json
{
  "staDate": "2026-03-09",
  "endDate": "2026-03-15"
}
```

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| staDate | body | String | N | 시작일 (yyyy-MM-dd), 미입력 시 자동 계산 |
| endDate | body | String | N | 종료일 (yyyy-MM-dd), 미입력 시 자동 계산 |

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
