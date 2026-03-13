# DELETE /api/teams/{teamId}

## 설명
팀을 삭제한다. 소속 멤버의 teamId는 NULL로 변경된다.

## 요청
- **Method**: DELETE
- **URL**: `/api/teams/{teamId}`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| teamId | path | Long | O | 팀 ID |

### Request Body
없음

## 응답

### 200 OK
```json
{
  "success": true
}
```

### 에러
| 코드 | 설명 |
|------|------|
| 403 | 팀장만 삭제 가능 |
| 404 | 팀을 찾을 수 없음 |

## 관련 페이지
- 팀 생성 페이지
