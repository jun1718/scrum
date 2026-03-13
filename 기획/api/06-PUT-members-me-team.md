# PUT /api/members/me/team

## 설명
본인의 팀을 등록한다. member.teamId를 갱신한다.

## 요청
- **Method**: PUT
- **URL**: `/api/members/me/team`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
없음

### Request Body
```json
{
  "teamId": 1234567890123
}
```

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| teamId | body | Long | O | 등록할 팀 ID |

## 응답

### 200 OK
```json
{
  "memberId": 9876543210001,
  "memberName": "홍길동",
  "teamId": 1234567890123
}
```

### 에러
| 코드 | 설명 |
|------|------|
| 400 | 다중 팀 미지원 (이미 팀에 소속되어 있음) |

## 관련 페이지
- 팀 등록 페이지
