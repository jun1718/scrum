# PUT /api/members/{memberId}/team

## 설명
특정 멤버의 팀을 변경한다. 기존 멤버의 teamId를 갱신한다.

## 요청
- **Method**: PUT
- **URL**: `/api/members/{memberId}/team`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| memberId | path | Long | O | 멤버 ID |

### Request Body
```json
{
  "teamId": 1234567890123
}
```

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| teamId | body | Long | O | 변경할 팀 ID |

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
| - | - |

## 관련 페이지
- 팀원 등록 페이지
