# GET /api/teams/{teamId}/reports/monthly

## 설명
팀 공유용 월간 보고를 조회한다. 민감정보(performance)는 제외되며, 투입률(%)이 포함된다.

## 요청
- **Method**: GET
- **URL**: `/api/teams/{teamId}/reports/monthly`
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
    "reportId": 1000000000020,
    "staDate": "2026-03-01",
    "endDate": "2026-03-25",
    "reportDetailTags": [
      {
        "reportDetailTagId": 4000000000010,
        "tagId": 1234567890001,
        "tagName": "프로젝트A",
        "totalWorkHours": 120.0,
        "workRatio": 60.0
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
- 팀 업무 공유 월간
