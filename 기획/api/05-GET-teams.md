# GET /api/teams

## 설명
팀 목록을 검색한다.

## 요청
- **Method**: GET
- **URL**: `/api/teams`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| q | query | String | N | 검색어 (팀 이름) |

### Request Body
없음

## 응답

### 200 OK
```json
[
  {
    "teamId": 1234567890123,
    "teamName": "프론트엔드팀"
  },
  {
    "teamId": 1234567890124,
    "teamName": "백엔드팀"
  }
]
```

### 에러
| 코드 | 설명 |
|------|------|
| - | - |

## 관련 페이지
- 팀 등록 페이지
