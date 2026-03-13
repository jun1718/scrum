# POST /api/teams

## 설명
새 팀을 생성한다. 생성자는 자동으로 팀장(managerYn=Y)으로 등록된다.

## 요청
- **Method**: POST
- **URL**: `/api/teams`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
없음

### Request Body
```json
{
  "teamName": "프론트엔드팀"
}
```

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| teamName | body | String | O | 팀 이름 |

## 응답

### 200 OK
```json
{
  "teamId": 1234567890123,
  "teamName": "프론트엔드팀"
}
```

### 에러
| 코드 | 설명 |
|------|------|
| 409 | 이미 생성된 팀이 존재함 |

## 관련 페이지
- 팀 생성 페이지
