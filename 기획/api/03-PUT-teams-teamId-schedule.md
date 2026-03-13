# PUT /api/teams/{teamId}/schedule

## 설명
팀의 주간 보고 시작/종료 요일을 설정한다. 종료요일은 (시작요일+6)%7로 검증된다.

## 요청
- **Method**: PUT
- **URL**: `/api/teams/{teamId}/schedule`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| teamId | path | Long | O | 팀 ID |

### Request Body
```json
{
  "weekStartDay": 1,
  "weekEndDay": 0
}
```

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| weekStartDay | body | Integer | O | 주간 시작 요일 (0=일, 1=월, ..., 6=토) |
| weekEndDay | body | Integer | O | 주간 종료 요일 (0=일, 1=월, ..., 6=토) |

## 응답

### 200 OK
```json
{
  "teamId": 1234567890123,
  "weekStartDay": 1,
  "weekEndDay": 0
}
```

### 에러
| 코드 | 설명 |
|------|------|
| 400 | 요일 검증 실패 (종료요일 != (시작요일+6)%7) |

## 관련 페이지
- 팀 관리 페이지
