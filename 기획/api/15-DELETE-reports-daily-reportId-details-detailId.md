# DELETE /api/reports/daily/{reportId}/details/{detailId}

## 설명
데일리 보고의 개별 상세 행을 삭제한다.

## 요청
- **Method**: DELETE
- **URL**: `/api/reports/daily/{reportId}/details/{detailId}`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| reportId | path | Long | O | 보고 ID |
| detailId | path | Long | O | 보고 상세 ID |

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
- 데일리 슈크럼 작성 페이지
