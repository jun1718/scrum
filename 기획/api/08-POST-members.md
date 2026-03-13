# POST /api/members

## 설명
멤버를 생성하고 팀에 등록한다. Dooray API로 사원 정보를 조회한 후 생성한다.

## 요청
- **Method**: POST
- **URL**: `/api/members`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
없음

### Request Body
```json
{
  "memberName": "홍길동",
  "doorayMemberId": "abc123def456",
  "teamId": 1234567890123
}
```

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| memberName | body | String | O | 멤버 이름 |
| doorayMemberId | body | String | O | 두레이 멤버 ID |
| teamId | body | Long | O | 등록할 팀 ID |

## 응답

### 200 OK
```json
{
  "memberId": 9876543210001,
  "memberName": "홍길동",
  "doorayMemberId": "abc123def456",
  "teamId": 1234567890123
}
```

### 에러
| 코드 | 설명 |
|------|------|
| 409 | 이미 존재하는 멤버 |

## 관련 페이지
- 팀원 등록 페이지
