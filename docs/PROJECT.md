# zm-editor 프로젝트 관리 문서

> 최종 업데이트: 2026-01-21

---

## 프로젝트 개요

**zm-editor**는 React/Next.js용 Notion 스타일 리치 텍스트 에디터 라이브러리입니다.
**개발자 친화적**인 기술 문서 작성에 최적화되어 있습니다.

### 목표

- MIT 라이센스로 npm 배포
- React 18+ / Next.js 13+ 호환
- Notion-like 사용자 경험 제공
- 확장 가능한 플러그인 아키텍처
- **다국어 지원 (i18n)** - 한국어, 영어 기본 제공
- **개발자 친화적** - 코드블록, 다이어그램, 수식 지원
- **보안 우선** - XSS 방지, 안전한 파일 업로드

### 기술 스택

| 분류 | 기술 |
|------|------|
| **코어** | Tiptap (ProseMirror 기반) |
| **프레임워크** | React 19, Next.js 15 |
| **언어** | TypeScript 5.7+ |
| **빌드** | tsup, Turbo |
| **패키지 관리** | pnpm workspaces |
| **신택스 하이라이팅** | lowlight (highlight.js) |

---

## 프로젝트 구조

```
zm-editor/
├── docs/                       # 프로젝트 문서
│   ├── PROGRESS.md            # 진행상황
│   ├── SESSION.md             # 세션 상황 (Claude용)
│   └── PROJECT.md             # 이 문서
│
├── packages/
│   ├── core/                   # @zm-editor/core
│   │   ├── src/
│   │   │   ├── extensions/    # Tiptap 확장
│   │   │   │   ├── starter-kit.ts
│   │   │   │   └── slash-command.ts
│   │   │   └── utils/
│   │   └── package.json
│   │
│   └── react/                  # @zm-editor/react
│       ├── src/
│       │   ├── components/    # React 컴포넌트
│       │   │   ├── Editor.tsx
│       │   │   ├── BubbleMenu.tsx
│       │   │   ├── CodeBlock.tsx
│       │   │   └── SlashMenu.tsx
│       │   └── hooks/
│       └── package.json
│
│   └── canvas/                # @zm-editor/canvas (확장 모듈)
│       ├── src/
│       │   ├── core/          # 캔버스 엔진
│       │   ├── shapes/        # 도형 클래스
│       │   ├── tools/         # 드로잉 도구
│       │   └── components/    # React 컴포넌트
│       └── package.json
│
├── apps/
│   └── demo/                   # Next.js 데모 앱
│       └── src/app/
│
├── package.json               # 루트 워크스페이스
├── turbo.json                 # Turbo 설정
├── pnpm-workspace.yaml        # pnpm 워크스페이스
└── CLAUDE.md                  # Claude Code 가이드
```

---

## 패키지 설명

### @zm-editor/core

Tiptap 확장과 유틸리티를 제공하는 프레임워크 독립적인 코어 패키지.

**주요 내보내기:**
- `createStarterExtensions()` - 기본 확장 세트
- `SlashCommand` - 슬래시 명령어 확장
- `defaultSlashCommands` - 기본 명령어 목록
- `CodeBlockLowlight` - 코드블록 확장
- `lowlight` - lowlight 인스턴스

### @zm-editor/react

React 컴포넌트와 훅을 제공하는 패키지.

**주요 내보내기:**
- `ZmEditor` - 메인 에디터 컴포넌트
- `BubbleMenu` - 버블 메뉴 컴포넌트
- `CodeBlock` - 코드블록 컴포넌트 (언어 선택 UI)
- `useEditor` - Tiptap useEditor 재내보내기

### @zm-editor/canvas (확장 모듈)

draw.io/FigJam/Excalidraw 스타일의 다이어그램/화이트보드 기능을 제공하는 확장 패키지.

> **참고**: 이 모듈은 별도의 독립 프로젝트로 분리될 수 있으나, 기본적으로 zm-editor와 통합 가능해야 합니다.

**특징:**
- zm-editor 내 노드로 임베드 가능 (ReactNodeViewRenderer)
- 독립 실행 모드 지원 (standalone)
- Claude Code와 함께 자체 개발 (외부 라이브러리 의존 최소화)

**주요 기능:**
- `CanvasEditor` - 메인 캔버스 컴포넌트
- `CanvasNode` - Tiptap 노드 확장
- `ShapeLibrary` - 도형 라이브러리
- `ExportUtils` - SVG/PNG 내보내기

**아키텍처:**
```
┌─────────────────────────────────────────────┐
│                zm-editor                     │
│  ┌───────────────────────────────────────┐  │
│  │          ZmEditor (Tiptap)            │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │   CanvasNode (NodeView)         │  │  │
│  │  │   ┌─────────────────────────┐   │  │  │
│  │  │   │    @zm-editor/canvas    │   │  │  │
│  │  │   │    (임베드 모드)         │   │  │  │
│  │  │   └─────────────────────────┘   │  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘

또는

┌─────────────────────────────────────────────┐
│           @zm-editor/canvas                  │
│           (독립 실행 모드)                    │
└─────────────────────────────────────────────┘
```

---

## 개발 명령어

```bash
# 개발 서버 시작
pnpm dev

# 빌드
pnpm build

# 타입 체크
pnpm type-check

# 클린
pnpm clean
```

---

## 다국어 지원 (i18n)

### 개요

zm-editor는 다국어 UI를 지원합니다. 내장 로케일과 커스텀 번역을 모두 지원합니다.

### 지원 언어

| 언어 | 코드 | 상태 |
|------|------|------|
| 영어 | `en` | 기본값 |
| 한국어 | `ko` | 필수 |
| 일본어 | `ja` | 선택 (추후) |

### 번역 대상 영역

| 영역 | 설명 | 예시 |
|------|------|------|
| **슬래시 메뉴** | 명령어 제목/설명 | "Heading 1" → "제목 1" |
| **버블 메뉴** | 툴팁 텍스트 | "Bold" → "굵게" |
| **에디터** | 플레이스홀더 | "Type '/' for commands" → "'/'를 입력하여 명령어 사용" |
| **다이얼로그** | 프롬프트 메시지 | "Enter URL" → "URL을 입력하세요" |

### 사용 방법

```tsx
import { ZmEditor, koLocale, enLocale } from '@zm-editor/react';

// 방법 1: 내장 로케일 사용
<ZmEditor locale={koLocale} />

// 방법 2: 커스텀 로케일
<ZmEditor
  locale={{
    ...koLocale,
    editor: {
      placeholder: '내용을 입력하세요...',
    },
  }}
/>

// 방법 3: 번역 함수 주입 (고급)
<ZmEditor
  t={(key) => myTranslations[key]}
/>
```

### 로케일 인터페이스

```typescript
interface ZmEditorLocale {
  // 에디터
  editor: {
    placeholder: string;
  };

  // 슬래시 메뉴
  slashMenu: {
    noResults: string;
    commands: {
      text: { title: string; description: string };
      heading1: { title: string; description: string };
      heading2: { title: string; description: string };
      heading3: { title: string; description: string };
      bulletList: { title: string; description: string };
      numberedList: { title: string; description: string };
      taskList: { title: string; description: string };
      quote: { title: string; description: string };
      codeBlock: { title: string; description: string };
      divider: { title: string; description: string };
    };
  };

  // 버블 메뉴
  bubbleMenu: {
    bold: string;
    italic: string;
    underline: string;
    strikethrough: string;
    code: string;
    highlight: string;
    link: string;
  };

  // 다이얼로그
  dialogs: {
    linkPrompt: string;
    imageUrlPrompt: string;
  };
}
```

---

## 기능 요구사항

### 핵심 기능 (구현 완료)

| 기능 | 설명 | 상태 |
|------|------|------|
| 기본 텍스트 편집 | 입력, 삭제, 서식 | ✅ |
| 마크다운 단축키 | `#`, `##`, `-`, `1.` 등 | ✅ |
| 키보드 단축키 | `Ctrl+B`, `Ctrl+I` 등 | ✅ |
| 슬래시 명령어 | `/` 입력 시 메뉴 | ✅ |
| 버블 메뉴 | 텍스트 선택 시 도구 | ✅ |
| 코드블록 | 언어 선택 + 신택스 하이라이팅 | ✅ |

### 테이블 기능

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 테이블 생성/삭제 | `insertTable()`, `deleteTable()` | 필수 |
| 행/열 추가/삭제 | 컨텍스트 메뉴 | 필수 |
| 셀 병합/분할 | `mergeCells()`, `splitCell()` | 필수 |
| 헤더 행/열 | 첫 행/열 헤더 지정 | 필수 |
| 셀 크기 조절 | 드래그로 조절 | 권장 |
| 셀 배경색 | 색상 선택기 | 권장 |

**필요 패키지**: `@tiptap/extension-table`, `@tiptap/extension-table-row`, `@tiptap/extension-table-header`, `@tiptap/extension-table-cell`

### 이미지 업로드

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| URL 삽입 | URL로 이미지 추가 | ✅ 완료 |
| 드래그 앤 드롭 | 파일 드래그로 업로드 | 필수 |
| 복사/붙여넣기 | 클립보드에서 이미지 | 필수 |
| 이미지 리사이즈 | 드래그로 크기 조절 | 필수 |
| 캡션 | 이미지 설명 텍스트 | 권장 |
| 정렬 | 좌/중/우 정렬 | 권장 |
| Alt 텍스트 | 접근성용 대체 텍스트 | 필수 |

**필요 패키지**: `@tiptap/extension-image`, `@tiptap/extension-file-handler`

**업로드 아키텍처**:
```
[사용자] → [에디터] → [FileHandler] → [백엔드 API] → [S3 Presigned URL] → [S3 업로드] → [URL 반환]
```

### 파일 업로드/첨부

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 파일 업로드 | 드래그 앤 드롭, 파일 선택 | 필수 |
| 파일 미리보기 | PDF 미리보기 (PDF.js) | 권장 |
| 파일 다운로드 | 다운로드 버튼 | 필수 |
| 파일 정보 표시 | 파일명, 크기, 타입 | 필수 |
| 외부 링크 | URL로 파일 임베드 | 권장 |

**지원 파일 타입**:
- 문서: PDF, DOCX, XLSX, PPTX
- 이미지: PNG, JPG, GIF, SVG, WebP
- 비디오: MP4, WebM
- 오디오: MP3, WAV, OGG
- 압축: ZIP, RAR

**구현 방식**: 커스텀 `FileAttachment` 노드 확장 필요

### 개발자 친화적 기능

#### 수학 공식 (KaTeX)

| 항목 | 내용 |
|------|------|
| **렌더링 엔진** | KaTeX |
| **확장** | `@tiptap/extension-mathematics` |
| **문법** | 인라인: `$E=mc^2$`, 블록: `$$\sum_{i=1}^{n}$$` |

#### 다이어그램 (Mermaid)

| 항목 | 내용 |
|------|------|
| **라이브러리** | Mermaid.js |
| **지원 다이어그램** | Flowchart, Sequence, Class, ER, Gantt, Pie |
| **구현** | 커스텀 노드뷰 필요 |

#### Callout/Admonition 블록

| 타입 | 용도 | 색상 |
|------|------|------|
| `note` | 일반 정보 | 파란색 |
| `tip` | 유용한 팁 | 초록색 |
| `warning` | 주의사항 | 노란색 |
| `danger` | 위험/에러 | 빨간색 |
| `info` | 추가 정보 | 보라색 |

#### 코드블록 고급 기능

| 기능 | 현재 상태 | 우선순위 |
|------|----------|----------|
| 언어 선택 | ✅ 완료 | - |
| 신택스 하이라이팅 | ✅ 완료 | - |
| 라인 넘버 | ❌ 미구현 | 필수 |
| 복사 버튼 | ❌ 미구현 | 필수 |
| 파일명 표시 | ❌ 미구현 | 권장 |
| 라인 하이라이트 | ❌ 미구현 | 권장 |
| Diff 표시 | ❌ 미구현 | 선택 |

#### 기타 개발자 기능

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 마크다운 Export | 에디터 → MD 변환 | 필수 |
| 마크다운 Import | MD → 에디터 변환 | 필수 |
| 접이식 블록 | `<details>` 토글 | 권장 |
| `<kbd>` 태그 | 키보드 단축키 표시 | 권장 |
| 링크 미리보기 | OEmbed 카드 | 선택 |
| 목차 (TOC) | 자동 헤딩 목록 | 필수 |

#### 외부 코드 임베드

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| GitHub Gist 임베드 | Gist URL로 코드 스니펫 삽입 | 권장 |
| CodeSandbox 임베드 | 라이브 React/Vue 프로젝트 임베드 | 권장 |
| StackBlitz 임베드 | 풀스택 웹 IDE 임베드 | 선택 |
| CodePen 임베드 | HTML/CSS/JS 데모 임베드 | 선택 |
| Replit 임베드 | 다양한 언어 실행 환경 | 선택 |

**구현 방식**: iframe 기반 OEmbed 또는 커스텀 노드뷰

#### API 문서 블록

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| HTTP Request 블록 | GET/POST/PUT/DELETE 요청 문서화 | 필수 |
| API Response 블록 | 응답 예시 (JSON/XML) 표시 | 필수 |
| Request/Response 탭 | 요청/응답 탭 전환 UI | 권장 |
| OpenAPI/Swagger 임베드 | API 스펙 시각화 | 선택 |
| GraphQL 쿼리 블록 | GraphQL 문법 하이라이팅 | 선택 |

**HTTP Request 블록 예시**:
```
┌─────────────────────────────────────────────────┐
│ POST /api/users                          [📋]  │
├─────────────────────────────────────────────────┤
│ Headers                                         │
│   Content-Type: application/json                │
│   Authorization: Bearer {token}                 │
├─────────────────────────────────────────────────┤
│ Body                                            │
│   {                                             │
│     "name": "John",                             │
│     "email": "john@example.com"                 │
│   }                                             │
└─────────────────────────────────────────────────┘
```

#### 터미널/CLI 블록

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 명령어 블록 | `$` 프롬프트 스타일 표시 | 필수 |
| 출력 블록 | 명령어 실행 결과 표시 | 필수 |
| 명령어 복사 버튼 | 명령어만 복사 (출력 제외) | 필수 |
| OS별 탭 | macOS/Linux/Windows 탭 전환 | 권장 |

**터미널 블록 예시**:
```
┌─────────────────────────────────────────────────┐
│ Terminal                         [macOS ▼]     │
├─────────────────────────────────────────────────┤
│ $ npm install @zm-editor/react           [📋]  │
│ added 42 packages in 3s                         │
│                                                 │
│ $ npm run dev                            [📋]  │
│ Server running at http://localhost:3000         │
└─────────────────────────────────────────────────┘
```

#### 환경 변수 / 설정 블록

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 환경 변수 블록 | `.env` 스타일 변수 문서화 | 권장 |
| 설정 파일 블록 | JSON/YAML/TOML 설정 예시 | 권장 |
| 민감 정보 마스킹 | API 키, 비밀번호 자동 마스킹 | 권장 |

**환경 변수 블록 예시**:
```
┌─────────────────────────────────────────────────┐
│ 🔐 Environment Variables                        │
├─────────────────────────────────────────────────┤
│ DATABASE_URL      postgresql://localhost/mydb   │
│ API_KEY           ••••••••••••••••              │
│ SECRET_KEY        ••••••••••••••••              │
│ NODE_ENV          development                   │
└─────────────────────────────────────────────────┘
```

#### 버전 관리 / Changelog 블록

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| Changelog 블록 | Keep a Changelog 스타일 | 권장 |
| 버전 배지 | `v1.2.3` 버전 태그 표시 | 선택 |
| Deprecation 경고 | 지원 중단 예정 표시 | 선택 |
| Since 태그 | "v2.0부터 지원" 표시 | 선택 |

**Changelog 블록 예시**:
```
┌─────────────────────────────────────────────────┐
│ 📋 Changelog                                    │
├─────────────────────────────────────────────────┤
│ ## [1.2.0] - 2026-01-21                        │
│ ### Added                                       │
│ - 다국어 지원 (한국어, 영어)                      │
│ - 테이블 기능                                    │
│ ### Fixed                                       │
│ - 코드블록 복사 버튼 오류 수정                    │
└─────────────────────────────────────────────────┘
```

#### 주석 / 참조 기능

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 각주 (Footnotes) | 하단 참조 주석 [^1] | 권장 |
| 용어 정의 (Glossary) | 마우스 오버 시 정의 팝오버 | 선택 |
| 참고문헌 (References) | 학술 스타일 인용 | 선택 |
| 내부 링크/앵커 | 문서 내 섹션 이동 | 권장 |

#### 코드 비교 (Diff) 블록

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 코드 Diff | 추가(+)/삭제(-) 라인 하이라이트 | 권장 |
| Before/After 탭 | 변경 전/후 비교 탭 | 선택 |
| 인라인 Diff | 단어 수준 변경 표시 | 선택 |

**Diff 블록 예시**:
```diff
- const oldFunction = () => {
+ const newFunction = () => {
    return "Hello World";
  }
```

#### 디버깅 / 에러 블록

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 에러 메시지 블록 | 빨간색 에러 박스 | 권장 |
| 스택 트레이스 블록 | 접이식 스택 트레이스 | 선택 |
| 로그 블록 | 로그 레벨별 색상 (INFO/WARN/ERROR) | 선택 |

#### 메타데이터 블록

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 작성자/수정일 | 문서 메타 정보 표시 | 선택 |
| 난이도 표시 | 초급/중급/고급 배지 | 선택 |
| 예상 소요 시간 | "읽는데 5분" 표시 | 선택 |
| 태그/카테고리 | 문서 분류 태그 | 선택 |

#### 추가 다이어그램 지원

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| ASCII 다이어그램 | 텍스트 기반 다이어그램 보존 | 선택 |
| PlantUML | UML 다이어그램 렌더링 | 선택 |
| D2 다이어그램 | 모던 다이어그램 언어 | 선택 |

### 다이어그램/캔버스 모듈 (@zm-editor/canvas)

> draw.io, FigJam, Excalidraw와 같은 다이어그램/화이트보드 기능

#### 핵심 요구사항

| 항목 | 설명 |
|------|------|
| **통합 모드** | zm-editor 내 노드로 임베드 가능 |
| **독립 모드** | 별도 앱으로 실행 가능 |
| **분리 가능** | 향후 별도 프로젝트로 분리 가능한 구조 |
| **자체 개발** | Claude Code와 함께 직접 개발 |

#### 기본 도형

| 도형 | 설명 | 우선순위 |
|------|------|----------|
| Rectangle | 사각형 | 필수 |
| Ellipse | 원/타원 | 필수 |
| Diamond | 마름모 | 필수 |
| Line | 직선 | 필수 |
| Arrow | 화살표 연결선 | 필수 |
| Text | 텍스트 박스 | 필수 |
| Freehand | 자유 그리기 | 권장 |
| Image | 이미지 삽입 | 권장 |

#### 편집 기능

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 선택/이동 | 객체 선택 및 드래그 이동 | 필수 |
| 리사이즈 | 크기 조절 핸들 | 필수 |
| 회전 | 객체 회전 | 권장 |
| 복사/붙여넣기 | Ctrl+C/V | 필수 |
| 실행 취소/다시 실행 | Ctrl+Z/Y | 필수 |
| 그룹화 | 여러 객체 그룹화 | 권장 |
| 레이어 순서 | 앞으로/뒤로 보내기 | 권장 |
| 정렬/배분 | 객체 정렬 가이드 | 권장 |
| 스냅 가이드 | 정렬 보조선 표시 | 권장 |

#### 스타일링

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 채우기 색상 | 배경색 선택 | 필수 |
| 선 색상 | 테두리/선 색상 | 필수 |
| 선 두께 | 1px ~ 8px | 필수 |
| 선 스타일 | 실선/점선/대시 | 권장 |
| 투명도 | 객체 투명도 조절 | 권장 |
| 폰트 스타일 | 텍스트 서식 | 권장 |

#### 캔버스 기능

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 무한 캔버스 | 패닝으로 확장 | 필수 |
| 줌 인/아웃 | 마우스 휠 확대/축소 | 필수 |
| 그리드 표시 | 배경 그리드 | 권장 |
| 미니맵 | 전체 캔버스 미리보기 | 선택 |

#### 내보내기/불러오기

| 형식 | 설명 | 우선순위 |
|------|------|----------|
| JSON | 내부 데이터 형식 | 필수 |
| SVG | 벡터 이미지 내보내기 | 필수 |
| PNG | 래스터 이미지 내보내기 | 필수 |
| 클립보드 | 이미지로 복사 | 권장 |

#### 기술 스택 검토

| 라이브러리 | 라이센스 | 특징 | 채택 여부 |
|------------|----------|------|-----------|
| **Excalidraw** | MIT | 손그림 스타일, 완성도 높음 | 참고용 |
| **tldraw** | 상업용 | UI/UX 우수 | ❌ 라이센스 |
| **Konva.js** | MIT | 2D Canvas 라이브러리 | 기반 기술 후보 |
| **Fabric.js** | MIT | 2D Canvas 라이브러리 | 기반 기술 후보 |
| **React-Konva** | MIT | Konva React 래퍼 | 기반 기술 후보 |

#### 개발 접근 방식

1. **자체 개발**: 기존 라이브러리(Excalidraw, tldraw)를 그대로 사용하지 않음
2. **기반 기술**: Konva.js 또는 Fabric.js를 Canvas 렌더링 엔진으로 검토
3. **모듈화**: zm-editor와 독립적으로 동작할 수 있는 구조
4. **Claude Code 협업**: 기능 하나씩 Claude Code와 함께 구현

#### zm-editor 통합 방식

```typescript
// 방법 1: 슬래시 명령어로 삽입
// 사용자가 /diagram 입력 시 캔버스 노드 삽입

// 방법 2: CanvasNode 확장
import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CanvasNodeView } from '@zm-editor/canvas';

export const CanvasNode = Node.create({
  name: 'canvas',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      data: { default: null },  // 캔버스 JSON 데이터
      width: { default: 600 },
      height: { default: 400 },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CanvasNodeView);
  },
});
```

---

## 보안 요구사항

### XSS (Cross-Site Scripting) 방지

#### 알려진 Tiptap 취약점

| CVE | 패키지 | 해결 버전 |
|-----|--------|----------|
| CVE-2025-14284 | `@tiptap/extension-link` | 2.10.4+ |
| ProseMirror XSS | Tiptap Core | 2.5.6+ |

#### 필수 대응책

1. **DOMPurify 통합**
   ```typescript
   import DOMPurify from 'dompurify';
   const sanitized = DOMPurify.sanitize(html, config);
   ```

2. **위험한 URL 차단**
   - `javascript:` 프로토콜 차단
   - `data:` URL 제한
   - `vbscript:` 차단

3. **위험한 태그/속성 필터링**
   - 차단 태그: `<script>`, `<iframe>`, `<object>`, `<embed>`
   - 차단 속성: `onerror`, `onclick`, `onload`, `onmouseover`

4. **허용 태그 화이트리스트**
   ```typescript
   ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
                  'h1', 'h2', 'h3', 'blockquote', 'code', 'pre', 'img',
                  'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr']
   ```

### 파일 업로드 보안

#### 필수 검증

| 검증 | 설명 |
|------|------|
| **확장자 화이트리스트** | 허용된 확장자만 업로드 |
| **MIME 타입 검증** | Content-Type 헤더 확인 |
| **Magic Bytes 검증** | 파일 시그니처 확인 |
| **파일 크기 제한** | 최대 10MB (이미지), 50MB (파일) |
| **파일명 무작위화** | UUID로 파일명 변경 |

#### Magic Bytes 예시

| 타입 | 시그니처 |
|------|----------|
| JPEG | `FF D8 FF` |
| PNG | `89 50 4E 47` |
| GIF | `47 49 46 38` |
| PDF | `25 50 44 46` |

#### 백엔드 체크리스트

- [ ] 파일 확장자 화이트리스트
- [ ] MIME 타입 검증
- [ ] Magic Bytes 검증
- [ ] 파일 크기 제한
- [ ] 파일명 UUID 변환
- [ ] 업로드 디렉토리 실행 권한 제거
- [ ] Presigned URL 만료 시간 설정 (15분)
- [ ] 이미지 재인코딩 (메타데이터 제거)

### SSRF (Server-Side Request Forgery) 방지

#### 이미지 URL 검증

```typescript
// 차단해야 할 패턴
const blockedPatterns = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,  // Link-local
];
```

#### 프로토콜 제한

- 허용: `http:`, `https:`
- 차단: `file:`, `ftp:`, `data:`, `javascript:`

### Content Security Policy (CSP)

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://your-cdn.com data:;
  connect-src 'self' https://api.your-domain.com;
  frame-src 'none';
  object-src 'none';
```

### 보안 의존성

```json
{
  "dependencies": {
    "dompurify": "^3.0.0",
    "isomorphic-dompurify": "^2.0.0"
  }
}
```

### 데이터 저장 권장사항

| 방식 | 장점 | 단점 | 권장 |
|------|------|------|------|
| **JSON** | 구조화, 안전 | 호환성 제한 | ✅ 권장 |
| **HTML** | 범용성 | XSS 위험 | ⚠️ 주의 |

```typescript
// 권장: JSON 저장
const content = editor.getJSON();
await saveToDatabase(JSON.stringify(content));

// 복원
editor.commands.setContent(JSON.parse(saved));
```

---

## 배포 계획

### npm 패키지

| 패키지 | 상태 | npm 이름 |
|--------|------|----------|
| core | 미배포 | @zm-editor/core |
| react | 미배포 | @zm-editor/react |

### 배포 전 체크리스트

- [ ] README.md 작성
- [ ] CHANGELOG.md 작성
- [ ] API 문서 작성
- [ ] 사용 예제 추가
- [ ] 테스트 작성
- [ ] npm 계정 설정
- [ ] 패키지 버전 확정

---

## 의존성 관리

### 주요 의존성

| 패키지 | 버전 | 용도 |
|--------|------|------|
| @tiptap/core | ^2.11.0 | 에디터 코어 |
| @tiptap/react | ^2.11.0 | React 바인딩 |
| @tiptap/starter-kit | ^2.11.0 | 기본 확장 |
| lowlight | ^3.1.0 | 신택스 하이라이팅 |

### Peer Dependencies

| 패키지 | 버전 |
|--------|------|
| react | >=18 |
| react-dom | >=18 |

---

## Git 워크플로우

### 브랜치 전략

- `main` - 안정 버전
- `develop` - 개발 버전 (필요시)
- `feature/*` - 기능 개발

### 커밋 메시지 형식

```
<type>(<scope>): <subject>

<body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

**Type:**
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `refactor`: 리팩토링
- `style`: 코드 스타일
- `test`: 테스트
- `chore`: 빌드, 설정

---

## 연락처

- **GitHub**: https://github.com/hanumoka/zm-editor
- **라이센스**: MIT
