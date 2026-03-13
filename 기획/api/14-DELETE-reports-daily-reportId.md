# DELETE /api/reports/daily/{reportId}

## 설명
데일리 보고를 삭제한다. 연관된 reportDetail, peerReport도 함께 삭제된다.

## 요청
- **Method**: DELETE
- **URL**: `/api/reports/daily/{reportId}`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| reportId | path | Long | O | 보고 ID |

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
| - | - |

## 관련 페이지
- 데일리 보고 페이지
