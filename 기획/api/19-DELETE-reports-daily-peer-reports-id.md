# DELETE /api/reports/daily/peer-reports/{peerReportId}

## 설명
동료 협업 기록을 삭제한다.

## 요청
- **Method**: DELETE
- **URL**: `/api/reports/daily/peer-reports/{peerReportId}`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| peerReportId | path | Long | O | 동료 협업 기록 ID |

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
