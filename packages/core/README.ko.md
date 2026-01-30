# @zm-editor/core

zm-editor의 핵심 Tiptap 확장 및 유틸리티 - Notion 스타일 리치 텍스트 에디터입니다.

[![npm version](https://img.shields.io/npm/v/@zm-editor/core.svg)](https://www.npmjs.com/package/@zm-editor/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](./README.md) | **한국어**

## 설치

```bash
npm install @zm-editor/core
```

> **참고**: 이 패키지는 일반적으로 `@zm-editor/react`와 함께 사용됩니다. 대부분의 경우 두 패키지를 함께 설치하세요:
> ```bash
> npm install @zm-editor/core @zm-editor/react
> ```

## 포함 기능

### Tiptap 확장

- **StarterKit** - 공통 확장이 사전 구성된 Tiptap 스타터 킷
- **SlashCommand** - Notion 스타일 슬래시 명령어 메뉴
- **Mention** - @ 멘션 지원
- **CodeBlockLowlight** - 26개 이상 언어의 구문 강조
- **Table** - 셀 병합 및 배경색 지원 테이블
- **Image** - 크기 조절 및 정렬 기능이 포함된 향상된 이미지 확장
- **Custom Nodes** - 28개 이상의 커스텀 노드 확장 (Callout, Toggle, Embed, Mermaid 등)

### 보안 유틸리티

```typescript
import {
  isSafeLinkUrl,
  isSafeImageUrl,
  sanitizeUrl,
  checkSsrf,
  isPrivateIP,
} from '@zm-editor/core';

// URL 검증
isSafeLinkUrl('https://example.com'); // true
isSafeLinkUrl('javascript:alert(1)'); // false

// SSRF 보호
checkSsrf('http://192.168.1.1'); // { safe: false, reason: 'Private IP' }
checkSsrf('https://example.com'); // { safe: true }
```

### i18n 타입

```typescript
import type { ZmEditorLocale } from '@zm-editor/core';

const customLocale: ZmEditorLocale = {
  editor: {
    placeholder: '내용을 입력하세요...',
  },
  // ... 기타 로케일 키
};
```

## @zm-editor/react와 함께 사용

```tsx
import { ZmEditor } from '@zm-editor/react';

export default function MyEditor() {
  return (
    <ZmEditor
      initialContent="<p>안녕하세요!</p>"
      onChange={(editor) => console.log(editor.getJSON())}
    />
  );
}
```

## 피어 의존성

- `@tiptap/core` ^2.11.0
- `@tiptap/pm` ^2.11.0

## 관련 패키지

| 패키지 | 설명 |
|--------|------|
| [@zm-editor/react](https://www.npmjs.com/package/@zm-editor/react) | React 컴포넌트 및 훅 |

## 링크

- [GitHub 저장소](https://github.com/hanumoka/zm-editor)
- [문서](https://github.com/hanumoka/zm-editor#readme)

## 라이선스

[MIT](https://github.com/hanumoka/zm-editor/blob/main/LICENSE)
