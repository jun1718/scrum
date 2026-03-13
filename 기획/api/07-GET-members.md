# GET /api/members

## 설명
멤버를 이름 또는 이메일로 검색한다.

## 요청
- **Method**: GET
- **URL**: `/api/members`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| q | query | String | N | 검색어 (이름 또는 이메일) |

### Request Body
없음

## 응답

### 200 OK
```json
[
  {
    "memberId": 9876543210001,
    "memberName": "홍길동",
    "doorayMemberId": "abc123def456",
    "teamId": 1234567890123
  }
]
```

### 에러
| 코드 | 설명 |
|------|------|
| - | - |

## 관련 페이지
- 팀원 등록 페이지
