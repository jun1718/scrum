# PUT /api/teams/{teamId}/tags

## 설명
팀의 태그를 일괄 저장한다 (Replace All). 기존 태그를 전체 삭제 후 재저장한다.

## 요청
- **Method**: PUT
- **URL**: `/api/teams/{teamId}/tags`
- **인증**: JWT (Authorization: Bearer {token})

### Parameters
| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| teamId | path | Long | O | 팀 ID |

### Request Body
```json
{
  "tags": [
    {
      "tagName": "프로젝트A",
      "type": "MONTHLY",
      "children": [
        {
          "tagName": "기능개발",
          "type": "WEEKLY"
        },
        {
          "tagName": "버그수정",
          "type": "WEEKLY"
        }
      ]
    },
    {
      "tagName": "프로젝트B",
      "type": "MONTHLY",
      "children": [
        {
          "tagName": "설계",
          "type": "WEEKLY"
        }
      ]
    }
  ]
}
```

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|:----:|------|
| tags | body | Array | O | 태그 목록 |
| tags[].tagName | body | String | O | 태그 이름 |
| tags[].type | body | String | O | 태그 유형 (MONTHLY, WEEKLY) |
| tags[].parentTagId | body | Long | N | 부모 태그 ID |
| tags[].children | body | Array | N | 하위(주간) 태그 목록 |

## 응답

### 200 OK
```json
{
  "tags": [
    {
      "tagId": 1234567890001,
      "tagName": "프로젝트A",
      "type": "MONTHLY",
      "parentTagId": null,
      "children": [
        {
          "tagId": 1234567890002,
          "tagName": "기능개발",
          "type": "WEEKLY",
          "parentTagId": 1234567890001
        },
        {
          "tagId": 1234567890003,
          "tagName": "버그수정",
          "type": "WEEKLY",
          "parentTagId": 1234567890001
        }
      ]
    }
  ]
}
```

### 에러
| 코드 | 설명 |
|------|------|
| 400 | 월간 태그 내 주간 태그가 없음 |

## 관련 페이지
- 팀 관리 페이지
