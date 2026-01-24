# zm-editor 세션 상황

> **이 파일은 Claude 세션 시작 시 자동으로 읽어야 합니다.**
>
> 최종 업데이트: 2026-01-24

---

## 현재 프로젝트 상태

| 항목 | 상태 |
|------|------|
| **현재 Phase** | Phase 13 진행중 🔄 |
| **빌드 상태** | 성공 ✅ |
| **타입 체크** | 성공 ✅ |
| **Git 상태** | Clean |
| **개발 서버** | 포트 3100 (FE), 포트 4000 (API) |

### 최근 완료 ✅

- Phase 13: 안정화 및 최적화 (진행중)
  - 접근성(a11y) 개선: BubbleMenu, TableBubbleMenu, Editor 컴포넌트
    - `aria-label`, `aria-pressed` 버튼 속성 추가
    - `role="toolbar"`, `role="group"` 추가
    - SVG 아이콘에 `aria-hidden="true"` 추가
    - 로딩/업로드 상태에 `aria-live`, `aria-busy` 추가

- Phase 12: 개발자 기능 (선택) 완료 ✅

---

## 완료된 Phase

### Phase 1~6: 핵심 기능 ✅

- 모노레포 구조 (pnpm workspaces + Turbo)
- Tiptap 기반 에디터 컴포넌트
- 슬래시 명령어 (22개+), 버블 메뉴
- 코드블록 + 언어 선택 UI + 신택스 하이라이팅 (26개 언어)
- 다국어 지원 (한국어/영어)
- 테이블 (생성, 행/열 추가삭제, 셀 병합/분할, 헤더 토글, 셀 배경색)

### Phase 7: 이미지 및 커스텀 노드 ✅

- ImageNode (리사이즈, 정렬, 캡션, Alt 텍스트 인라인 편집)
- 이미지 업로드 (드래그앤드롭, 붙여넣기, 파일 선택)
- 업로드 진행률 콜백, 에러 핸들러
- 업로드 플레이스홀더 (스켈레톤 UI, 진행률 표시)
- Base64 폴백 (서버 없이 동작)
- EmbedNode (YouTube, Vimeo, Twitter, CodePen, CodeSandbox)
- CalloutNode (6가지 색상)
- ToggleNode (접기/펼치기)
- BookmarkNode (링크 미리보기 카드)
- MathNode (KaTeX LaTeX 수식)

### Phase 8: 파일 업로드/첨부 ✅

- FileAttachmentNode (파일 첨부 노드)
- 파일 타입별 아이콘 (PDF, Word, Excel, PowerPoint, Archive, Text, Image, Video, Audio)
- `/file` 슬래시 명령어
- 파일 다운로드 버튼, 캡션 지원
- PDF 미리보기 (PDF.js 연동, optional peer dependency)

### Phase 9: 보안 강화 ✅

- Core 보안 모듈 (`@zm-editor/core/security`)
- URL 검증 (javascript:, vbscript:, data: 차단)
- URL 제어 문자 sanitization (CVE-2024-56412 대응)
- SSRF 방지 (사설 IP, localhost, 클라우드 메타데이터 차단)
- 다양한 IP 표기법 지원 (10진수, 8진수, 16진수, IPv6 매핑)
- BubbleMenu 링크 URL 검증
- ImageNode SSRF 검증
- EmbedNode iframe sandbox 속성 추가
- DOMPurify HTML sanitizer 통합 (optional peer dependency)
- 보안 문서화 (`docs/SECURITY.md`)

### Phase 10: 개발자 기능 (필수) ✅

- 코드블록 라인 넘버 + 복사 버튼
- 마크다운 Export/Import
- 목차 (TOC) 자동 생성
- 터미널/CLI 블록
- API Request/Response 블록

### Phase 11: 개발자 기능 (권장) ✅

- [x] `<kbd>` 태그 (키보드 단축키)
- [x] 코드블록 파일명 표시
- [x] Mermaid 다이어그램 지원
- [x] 라이트/다크 모드 전환 (데모 앱)
- [x] 에러 메시지 블록 (error/warning/info/success) - ErrorMessageNode
- [x] OS별 명령어 탭 (macOS/Linux/Windows) - OsCommandNode
- [x] Changelog 블록 (ChangelogNode) - Keep a Changelog 형식 지원
- [x] 코드블록 라인 하이라이트 - 범위 지원 (1,3-5,7)
- [x] 환경 변수 블록 (EnvBlockNode) - 민감 정보 마스킹
- [x] GitHub Gist 임베드 (GistNode)
- [x] 코드 Diff 블록 (DiffBlockNode)
- [x] 각주 (FootnoteNode)

### Phase 12: 개발자 기능 (선택) ✅

- [x] StackBlitz/Replit 임베드 (EmbedNode 확장)
- [x] 버전 배지 / Since 태그 (VersionBadge 마크)
- [x] 로그 블록 (LogBlockNode) - debug/info/warn/error 레벨
- [x] 스택 트레이스 블록 (StackTraceNode)
- [x] 메타데이터 블록 (MetadataNode)
- [x] GraphQL 쿼리 블록 (GraphQLNode)
- [x] OpenAPI/Swagger 임베드 (OpenAPINode)
- [x] PlantUML / D2 다이어그램 (DiagramNode)
- [x] 용어 정의 (Glossary 마크)

### 데모 앱 개선 ✅

- 사용 가이드 사이드바 (슬래시 명령어, 단축키, 마크다운)
- 언어 토글 (한국어/영어)
- 라이트/다크/시스템 테마 토글
- JSON/Markdown 출력 뷰어
- Hydration 오류 수정 (dynamic import)
- TaskList 체크박스 정렬 수정

### UX 개선 ✅

- 슬래시 메뉴 스크롤 시 자동 닫힘 (scroll/wheel/touchmove 이벤트 감지)

---

## 다음 작업

### Phase 13: 안정화 및 최적화 (진행중)
- [ ] 성능 최적화 검증
- [ ] 메모리 누수 테스트
- [ ] 다양한 브라우저 호환성 테스트
- [x] 접근성(a11y) 개선 - BubbleMenu, TableBubbleMenu, Editor
- [ ] 번들 크기 최적화

---

## 전체 로드맵 요약

| Phase | 내용 | 상태 |
|-------|------|------|
| 1~4 | 핵심 에디터 기능 | ✅ 완료 |
| 5 | 다국어 지원 (i18n) | ✅ 완료 |
| 6 | 테이블 기능 | ✅ 완료 |
| 7 | 이미지/커스텀 노드 | ✅ 완료 |
| 8 | 파일 업로드/첨부 | ✅ 완료 |
| 9 | 보안 강화 | ✅ 완료 |
| 10 | 개발자 기능 (필수) | ✅ 완료 |
| 11 | 개발자 기능 (권장) | ✅ 완료 |
| 12 | 개발자 기능 (선택) | ✅ 완료 |
| 13 | 안정화 및 최적화 | 🔄 진행중 |
| 14 | npm 배포 준비 | 📋 대기 |
| 15 | 추가 기능 (선택) | 📋 대기 |

---

## 구현된 슬래시 명령어 (34개)

| 명령어 | 기능 |
|--------|------|
| `/text` | 일반 텍스트 |
| `/h1`, `/h2`, `/h3` | 제목 |
| `/bullet` | 글머리 기호 목록 |
| `/number` | 번호 매기기 목록 |
| `/task` | 체크리스트 |
| `/quote` | 인용구 |
| `/code` | 코드블록 |
| `/divider` | 구분선 |
| `/table` | 테이블 (3x3) |
| `/image` | 이미지 |
| `/file` | 파일 첨부 |
| `/embed` | 임베드 (YouTube, StackBlitz, Replit 등) |
| `/callout` | 콜아웃 박스 |
| `/toggle` | 토글 (접기/펼치기) |
| `/bookmark` | 북마크 (링크 미리보기) |
| `/math` | 수학 수식 (LaTeX) |
| `/toc` | 목차 (Table of Contents) |
| `/terminal` | 터미널 블록 |
| `/api` | API 블록 |
| `/mermaid` | Mermaid 다이어그램 |
| `/error` | 에러/경고/정보 메시지 |
| `/os` | OS별 명령어 탭 (macOS/Linux/Windows) |
| `/changelog` | 버전 변경 이력 (Keep a Changelog 형식) |
| `/env` | 환경 변수 블록 (마스킹 지원) |
| `/gist` | GitHub Gist 임베드 |
| `/diff` | 코드 Diff 블록 |
| `/footnote` | 각주 블록 |
| `/log` | 로그 블록 (debug/info/warn/error) |
| `/stacktrace` | 스택 트레이스 블록 |
| `/metadata` | 문서 메타데이터 |
| `/graphql` | GraphQL 쿼리 블록 |
| `/openapi` | OpenAPI/Swagger 임베드 |
| `/diagram` | PlantUML/D2 다이어그램 |

---

## 주요 파일 위치

### 핵심 코드

| 파일 | 설명 |
|------|------|
| `packages/core/src/extensions/starter-kit.ts` | Tiptap 확장 설정 |
| `packages/core/src/extensions/slash-command.ts` | 슬래시 명령어 |
| `packages/react/src/components/Editor.tsx` | 메인 에디터 컴포넌트 |
| `packages/react/src/components/CodeBlock.tsx` | 코드블록 (언어 선택 UI) |
| `packages/react/src/components/BubbleMenu.tsx` | 버블 메뉴 |
| `packages/react/src/components/TableBubbleMenu.tsx` | 테이블 버블 메뉴 |

### 커스텀 노드 (24개)

| 파일 | 설명 |
|------|------|
| `packages/react/src/components/ImageNode/` | 리사이즈 이미지 |
| `packages/react/src/components/EmbedNode/` | 임베드 (YouTube, StackBlitz, Replit 등) |
| `packages/react/src/components/CalloutNode/` | 콜아웃 박스 |
| `packages/react/src/components/ToggleNode/` | 토글 블록 |
| `packages/react/src/components/BookmarkNode/` | 링크 미리보기 |
| `packages/react/src/components/MathNode/` | KaTeX 수식 |
| `packages/react/src/components/FileAttachmentNode/` | 파일 첨부 |
| `packages/react/src/components/TocNode/` | 목차 |
| `packages/react/src/components/TerminalNode/` | 터미널 블록 |
| `packages/react/src/components/ApiBlockNode/` | API 블록 |
| `packages/react/src/components/MermaidNode/` | Mermaid 다이어그램 |
| `packages/react/src/components/ErrorMessageNode/` | 에러/경고 메시지 |
| `packages/react/src/components/OsCommandNode/` | OS별 명령어 탭 |
| `packages/react/src/components/ChangelogNode/` | 버전 변경 이력 |
| `packages/react/src/components/EnvBlockNode/` | 환경 변수 (마스킹) |
| `packages/react/src/components/GistNode/` | GitHub Gist 임베드 |
| `packages/react/src/components/DiffBlockNode/` | 코드 Diff |
| `packages/react/src/components/FootnoteNode/` | 각주 |
| `packages/react/src/components/LogBlockNode/` | 로그 메시지 (4 레벨) |
| `packages/react/src/components/StackTraceNode/` | 스택 트레이스 |
| `packages/react/src/components/MetadataNode/` | 문서 메타데이터 |
| `packages/react/src/components/GraphQLNode/` | GraphQL 쿼리/응답 |
| `packages/react/src/components/OpenAPINode/` | OpenAPI/Swagger 임베드 |
| `packages/react/src/components/DiagramNode/` | PlantUML/D2 다이어그램 |

### 데모 앱

| 파일 | 설명 |
|------|------|
| `apps/demo/src/app/page.tsx` | 데모 페이지 (테마 토글 포함) |
| `apps/demo/src/app/EditorWrapper.tsx` | SSR 비활성화 래퍼 |
| `apps/demo/src/app/globals.css` | 스타일 + 다크모드 |
| `apps/demo/tailwind.config.js` | Tailwind 설정 (다크모드) |

---

## 세션 복원 명령어

```bash
# 1. 개발 서버 시작
cd C:/Users/amagr/project/zm-editor && pnpm dev

# 2. 빌드 확인
cd C:/Users/amagr/project/zm-editor && pnpm build

# 3. 타입 체크
cd C:/Users/amagr/project/zm-editor && pnpm type-check

# 4. Git 상태 확인
cd C:/Users/amagr/project/zm-editor && git status
```

---

## 프로젝트 정보

- **경로**: `C:/Users/amagr/project/zm-editor/`
- **GitHub**: `git@github-personal:hanumoka/zm-editor.git`
- **라이센스**: MIT
- **데모 서버**: http://localhost:3100
