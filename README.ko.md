# zm-editor

[Tiptap](https://tiptap.dev) (ProseMirror) 기반의 React / Next.js용 Notion 스타일 리치 텍스트 에디터입니다.

[![npm version](https://img.shields.io/npm/v/@zm-editor/react.svg)](https://www.npmjs.com/package/@zm-editor/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](./README.md) | **한국어**

## 주요 기능

- **Notion 스타일 UX** - 슬래시 명령어, 버블 메뉴, 드래그 앤 드롭 블록
- **35+ 슬래시 명령어** - 제목, 목록, 코드 블록, 테이블 등
- **28+ 커스텀 블록** - 이미지, 임베드, 콜아웃, 다이어그램, API 블록 등
- **구문 강조** - 26개 이상 언어 지원 (GitHub Dark 테마)
- **Mermaid 다이어그램** - 플로우차트, 시퀀스 다이어그램, 마인드맵
- **수학 수식** - KaTeX LaTeX 렌더링
- **다국어 지원** - 한국어 & 영어 내장
- **다크 모드** - 완전한 다크 모드 지원
- **보안** - XSS 방지, SSRF 보호, URL 검증
- **TypeScript** - 완전한 타입 정의 포함

## 설치

```bash
# npm
npm install @zm-editor/core @zm-editor/react

# yarn
yarn add @zm-editor/core @zm-editor/react

# pnpm
pnpm add @zm-editor/core @zm-editor/react
```

### 필수 의존성

```bash
npm install react react-dom
```

### 선택적 의존성

```bash
# Mermaid 다이어그램 (플로우차트, 시퀀스 다이어그램 등)
npm install mermaid

# 수학 수식 (LaTeX 렌더링)
npm install katex

# 파일 첨부의 PDF 미리보기
npm install pdfjs-dist

# HTML 새니타이징
npm install dompurify
```

> **참고:** Mermaid와 KaTeX는 선택 사항입니다. 설치하지 않은 경우, 다이어그램이나 수식 블록 사용 시 설치 안내가 표시됩니다.

## 빠른 시작

```tsx
'use client'; // Next.js App Router 필수

import { ZmEditor } from '@zm-editor/react';

export default function MyEditor() {
  return (
    <ZmEditor
      initialContent="<p>안녕하세요!</p>"
      onChange={(editor) => {
        console.log(editor.getJSON());
      }}
    />
  );
}
```

## Next.js 사용법

Next.js App Router에서는 SSR 문제를 피하기 위해 동적 import를 사용하세요:

```tsx
// components/EditorWrapper.tsx
'use client';

import dynamic from 'next/dynamic';

const ZmEditor = dynamic(
  () => import('@zm-editor/react').then((mod) => mod.ZmEditor),
  { ssr: false }
);

export default function EditorWrapper() {
  return <ZmEditor />;
}
```

## Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `initialContent` | `string \| JSONContent` | `''` | 초기 에디터 콘텐츠 (HTML 또는 JSON) |
| `onChange` | `(editor: Editor) => void` | - | 콘텐츠 변경 시 콜백 |
| `onImageUpload` | `(file: File) => Promise<string>` | - | 커스텀 이미지 업로드 핸들러 |
| `locale` | `ZmEditorLocale` | `enLocale` | 다국어 설정 |
| `editable` | `boolean` | `true` | 편집 가능/불가 설정 |
| `placeholder` | `string` | - | 플레이스홀더 텍스트 |
| `className` | `string` | - | 추가 CSS 클래스 |

## 슬래시 명령어

`/`를 입력하면 명령어 메뉴가 열립니다:

| 명령어 | 설명 |
|--------|------|
| `/text` | 일반 텍스트 |
| `/h1`, `/h2`, `/h3` | 제목 |
| `/bullet` | 글머리 기호 목록 |
| `/number` | 번호 목록 |
| `/task` | 할 일 목록 (체크리스트) |
| `/quote` | 인용문 |
| `/code` | 코드 블록 |
| `/table` | 테이블 (3x3) |
| `/image` | 이미지 업로드 |
| `/file` | 파일 첨부 |
| `/embed` | 임베드 (YouTube, CodeSandbox 등) |
| `/callout` | 콜아웃 박스 |
| `/toggle` | 토글 (접기/펼치기) |
| `/mermaid` | Mermaid 다이어그램 |
| `/math` | 수학 수식 (LaTeX) |
| `/terminal` | 터미널 블록 |
| `/api` | API 요청/응답 블록 |
| `/divider` | 구분선 |
| ... | 그 외 15개 이상 |

## 다국어 설정 (i18n)

```tsx
import { ZmEditor, koLocale, enLocale } from '@zm-editor/react';

// 한국어
<ZmEditor locale={koLocale} />

// 영어 (기본값)
<ZmEditor locale={enLocale} />

// 커스텀
<ZmEditor
  locale={{
    ...enLocale,
    editor: {
      placeholder: '내용을 입력하세요...',
    },
  }}
/>
```

## 커스텀 이미지 업로드

```tsx
<ZmEditor
  onImageUpload={async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const { url } = await response.json();
    return url; // 업로드된 이미지 URL 반환
  }}
/>
```

## 콘텐츠 내보내기

```tsx
import { useRef } from 'react';
import { ZmEditor, type ZmEditorRef } from '@zm-editor/react';

function MyEditor() {
  const editorRef = useRef<ZmEditorRef>(null);

  const handleExport = () => {
    const editor = editorRef.current?.editor;
    if (!editor) return;

    // JSON으로 내보내기
    const json = editor.getJSON();

    // HTML로 내보내기
    const html = editor.getHTML();

    // 텍스트로 내보내기
    const text = editor.getText();
  };

  return (
    <>
      <ZmEditor ref={editorRef} />
      <button onClick={handleExport}>내보내기</button>
    </>
  );
}
```

## 패키지

| 패키지 | 설명 |
|--------|------|
| [@zm-editor/core](./packages/core) | 코어 Tiptap 확장 및 유틸리티 |
| [@zm-editor/react](./packages/react) | React 컴포넌트 및 훅 |

## 브라우저 지원

- Chrome (최신)
- Firefox (최신)
- Safari (최신)
- Edge (최신)

## 요구 사항

- React 18+
- Node.js 18+

## 라이선스

[MIT](./LICENSE)

## 기여

기여를 환영합니다! PR을 제출하기 전에 기여 가이드라인을 읽어주세요.

## 링크

- [GitHub 저장소](https://github.com/hanumoka/zm-editor)
- [npm: @zm-editor/core](https://www.npmjs.com/package/@zm-editor/core)
- [npm: @zm-editor/react](https://www.npmjs.com/package/@zm-editor/react)
- [Tiptap 문서](https://tiptap.dev/docs)
