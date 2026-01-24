# zm-editor 진행상황

> 최종 업데이트: 2026-01-23

## 현재 버전

- **버전**: 0.1.0 (개발 중)
- **상태**: Alpha
- **완료**: Phase 1~12 완료
- **다음**: Phase 13 (안정화 및 최적화)

---

## Phase 요약

| Phase | 내용 | 상태 |
|-------|------|------|
| 1 | 프로젝트 초기 설정 | ✅ 완료 |
| 2 | 핵심 에디터 기능 | ✅ 완료 |
| 3 | Notion-like 기능 | ✅ 완료 |
| 4 | 코드블록 고급 기능 | ✅ 완료 |
| 5 | 다국어 지원 (i18n) | ✅ 완료 |
| 6 | 테이블 기능 | ✅ 완료 |
| 7 | 이미지 및 커스텀 노드 | ✅ 완료 |
| 8 | 파일 업로드/첨부 | ✅ 완료 |
| 9 | 보안 강화 | ✅ 완료 |
| 10 | 개발자 기능 (필수) | ✅ 완료 |
| 11 | 개발자 기능 (권장) | ✅ 완료 |
| 12 | 개발자 기능 (선택) | ✅ 완료 |
| 13 | 안정화 및 최적화 | 📋 대기 |
| 14 | npm 배포 준비 | 📋 대기 |
| 15 | 추가 기능 (선택) | 📋 대기 |

---

## 완료된 작업

### Phase 1: 프로젝트 초기 설정 ✅

- [x] 모노레포 구조 설정 (pnpm workspaces + Turbo)
- [x] @zm-editor/core 패키지 생성
- [x] @zm-editor/react 패키지 생성
- [x] Next.js 15 데모 앱 생성
- [x] TypeScript 설정
- [x] tsup 번들러 설정
- [x] Git 저장소 초기화
- [x] GitHub 원격 저장소 연결 (hanumoka/zm-editor)

### Phase 2: 핵심 에디터 기능 ✅

- [x] Tiptap 기반 에디터 컴포넌트 (ZmEditor)
- [x] 기본 텍스트 편집 기능
- [x] 마크다운 단축키 지원 (#, ##, -, 1. 등)
- [x] 키보드 단축키 (Ctrl+B, Ctrl+I 등)

### Phase 3: Notion-like 기능 ✅

- [x] 슬래시 명령어 메뉴 (/)
- [x] 버블 메뉴 (텍스트 선택 시 서식 도구)
- [x] 체크리스트 (Task List)
- [x] 인용구 (Blockquote)
- [x] 구분선 (Horizontal Rule)
- [x] 이미지 삽입
- [x] 링크 삽입

### Phase 4: 코드블록 고급 기능 ✅

- [x] CodeBlockLowlight 통합
- [x] 언어 선택 UI (드롭다운)
- [x] 신택스 하이라이팅 (GitHub Dark 테마)
- [x] 26개 언어 지원

### Phase 5: 다국어 지원 (i18n) ✅

- [x] i18n 타입/인터페이스 설계 (`ZmEditorLocale`)
- [x] 영어 로케일 정의 (`enLocale`)
- [x] 한국어 로케일 정의 (`koLocale`)
- [x] Editor 컴포넌트에 locale prop 적용
- [x] SlashMenu 다국어 적용
- [x] BubbleMenu 다국어 적용
- [x] 로케일 export 및 문서화

### Phase 6: 테이블 기능 ✅

- [x] `@tiptap/extension-table` 패키지 설치
- [x] 테이블 생성/삭제 기능
- [x] 행/열 추가/삭제
- [x] 셀 병합/분할
- [x] 헤더 행/열/셀 토글
- [x] 테이블 버블 메뉴 UI (TableBubbleMenu)
- [x] 슬래시 명령어에 "Table" 추가
- [x] 셀 크기 조절 (드래그)
- [x] 셀 배경색 선택

---

## 예정된 작업

### Phase 7: 이미지 및 커스텀 노드 ✅ (대부분 완료)

#### 7.1: ImageNode
- [x] `ImageNode` 커스텀 노드뷰 (NodeView)
- [x] 이미지 리사이즈 (드래그 핸들)
- [x] 이미지 정렬 (좌/중/우)
- [x] 이미지 캡션 편집
- [x] 드래그 앤 드롭 업로드
- [x] 복사/붙여넣기 업로드
- [x] 파일 선택 다이얼로그
- [x] 업로드 진행률 콜백 (`onProgress`)
- [x] 에러 핸들러 (`onImageUploadError`)
- [x] Base64 폴백 (서버 없이 동작)
- [x] `/image` 슬래시 명령어
- [x] 이미지 플레이스홀더 (업로드 중 스켈레톤) - 선택
- [x] Alt 텍스트 편집 UI 개선 - 선택

#### 7.2: EmbedNode
- [x] `EmbedNode` 커스텀 노드뷰
- [x] YouTube 임베드
- [x] Vimeo 임베드
- [x] Twitter/X 임베드
- [x] CodePen 임베드
- [x] CodeSandbox 임베드
- [x] `/embed` 슬래시 명령어

#### 7.3: CalloutNode
- [x] `CalloutNode` 커스텀 노드뷰
- [x] 6가지 색상 테마 (info, warning, error, success, tip, note)
- [x] 아이콘 + 편집 가능한 텍스트
- [x] `/callout` 슬래시 명령어

#### 7.4: ToggleNode
- [x] `ToggleNode` 커스텀 노드뷰
- [x] 접기/펼치기 기능
- [x] 중첩 콘텐츠 지원
- [x] `/toggle` 슬래시 명령어

#### 7.5: BookmarkNode
- [x] `BookmarkNode` 커스텀 노드뷰
- [x] 링크 메타데이터 가져오기
- [x] 미리보기 카드 (제목, 설명, 이미지, 도메인)
- [x] 캡션 편집 지원
- [x] `/bookmark` 슬래시 명령어
- [x] XSS 방지 (javascript: URL 차단)

#### 7.6: MathNode
- [x] `MathNode` 커스텀 노드뷰
- [x] KaTeX 렌더링
- [x] LaTeX 문법 지원
- [x] 인라인/블록 수식
- [x] `/math` 슬래시 명령어

#### 7.7: 데모 앱 개선
- [x] 사용 가이드 사이드바 (슬래시 명령어, 단축키, 마크다운)
- [x] 언어 토글 (한국어/영어)
- [x] JSON 출력 뷰어
- [x] Markdown 출력 뷰어 (커스텀 변환기)
- [x] Hydration 오류 수정 (dynamic import with ssr: false)
- [x] TaskList 체크박스 정렬 수정

### Phase 8: 파일 업로드/첨부 ✅

- [x] `FileAttachment` 커스텀 노드 생성
- [x] 파일 타입별 아이콘 세트 (PDF, Word, Excel, PowerPoint, Archive, Text, Image, Video, Audio)
- [x] 파일 드래그 앤 드롭
- [x] 파일 정보 표시 (파일명, 크기, 타입)
- [x] 파일 다운로드 버튼
- [x] PDF 미리보기 (PDF.js 연동, optional peer dependency)
- [x] 슬래시 명령어에 `/file` 추가

### Phase 9: 보안 강화 ✅

- [x] Core 보안 모듈 (`@zm-editor/core/security`)
- [x] URL 검증 유틸리티 (`isSafeLinkUrl`, `isSafeImageUrl`, `normalizeUrl`, `getSafeHref`)
- [x] URL sanitization (`sanitizeUrl`) - 제어 문자 제거로 CVE-2024-56412 대응
- [x] SSRF 방지 (`checkSsrf`, `isPrivateIP`, `isLocalhost`, `isCloudMetadataHost`)
- [x] IP 주소 정규화 (`normalizeIPv4`) - 10진수/8진수/16진수/IPv6 매핑 지원
- [x] BubbleMenu 링크 URL 검증 (`javascript:`, `vbscript:`, `data:` 차단)
- [x] ImageNode SSRF 검증 (사설 IP, localhost, 클라우드 메타데이터 차단)
- [x] EmbedNode iframe sandbox 속성 추가
- [x] 파일 업로드 검증 (백엔드 가이드 문서화)
- [x] CSP 헤더 가이드 문서화
- [x] 보안 문서 생성 (`docs/SECURITY.md`)
- [x] DOMPurify 통합 (optional peer dependency)

### Phase 10: 개발자 친화적 기능 (필수) ✅

- [x] 코드블록 라인 넘버
- [x] 코드블록 복사 버튼
- [x] 마크다운 Export (`editor.getMarkdown()`)
- [x] 마크다운 Import (`setContent` with markdown)
- [x] Callout/Admonition 블록 (note, tip, warning, danger) - Phase 7에서 구현 (CalloutNode)
- [x] 목차 (TOC) 자동 생성
- [x] 터미널/CLI 블록 (명령어 + 출력 + 복사 버튼)
- [x] API Request/Response 블록

### Phase 11: 개발자 친화적 기능 (권장) ✅

- [x] 수학 공식 (KaTeX) - Phase 7에서 구현 (MathNode)
- [x] 다이어그램 (Mermaid) - MermaidNode 커스텀 노드뷰
- [x] 접이식 블록 (`<details>`) - Phase 7에서 구현 (ToggleNode)
- [x] `<kbd>` 태그 (키보드 단축키) - Keyboard extension + BubbleMenu 버튼
- [x] 코드블록 파일명 표시 - CodeBlock filename 편집 기능
- [x] 라이트/다크 모드 전환 - 데모 앱 테마 토글 버튼
- [x] 에러 메시지 블록 (ErrorMessageNode) - error/warning/info/success 타입
- [x] 코드블록 라인 하이라이트 - 하이라이트 라인 입력 (예: 1,3-5,7)
- [x] GitHub Gist 임베드 - GistNode (URL 입력, iframe 렌더링)
- [x] CodeSandbox 임베드 (EmbedNode에 포함)
- [x] 환경 변수 블록 (EnvBlockNode) - 민감 정보 마스킹, 값 표시/숨김 토글
- [x] Changelog 블록 (ChangelogNode) - Keep a Changelog 형식 지원
- [x] 각주 (FootnoteNode) - 번호 자동 매김, 추가/삭제
- [x] 코드 Diff 블록 (DiffBlockNode) - 추가/삭제 라인 색상, 통계 표시
- [x] OS별 명령어 탭 (macOS/Linux/Windows) - OsCommandNode

### Phase 12: 개발자 친화적 기능 (선택) ✅

- [x] 링크 미리보기 (OEmbed) - Phase 7에서 구현 (BookmarkNode)
- [x] CodePen/CodeSandbox 임베드 - Phase 7에서 구현 (EmbedNode)
- [x] StackBlitz/Replit 임베드 - EmbedNode 확장
- [x] OpenAPI/Swagger 임베드 - OpenAPINode (Swagger UI/ReDoc/Minimal 모드)
- [x] GraphQL 쿼리 블록 - GraphQLNode (쿼리/변수/응답 탭)
- [x] 용어 정의 (Glossary 마크) - 호버 시 툴팁 표시
- [x] 스택 트레이스 블록 - StackTraceNode (파일 경로/라인 하이라이트)
- [x] 로그 블록 (debug/info/warn/error) - LogBlockNode
- [x] 버전 배지 / Since 태그 - VersionBadge 마크 (5가지 타입)
- [x] 메타데이터 블록 - MetadataNode (작성자, 난이도, 태그, 커스텀 필드)
- [x] PlantUML / D2 다이어그램 - DiagramNode (외부 서비스 연동)

### Phase 13: 안정화 및 최적화

- [ ] 성능 최적화 검증
- [ ] 메모리 누수 테스트
- [ ] 다양한 브라우저 호환성 테스트
- [ ] 접근성(a11y) 개선
- [ ] 번들 크기 최적화

### Phase 14: npm 배포 준비

- [ ] README.md 작성
- [ ] API 문서화
- [ ] 사용 예제 추가
- [ ] 라이센스 확인 (MIT)
- [ ] npm publish 설정
- [ ] CHANGELOG.md 작성

### Phase 15: 추가 기능 (선택)

- [ ] 멘션 (@) 기능
- [ ] 이모지 선택기
- [ ] 드래그 앤 드롭 블록 이동
- [ ] 협업 편집 (Y.js)

---

## 이슈 및 버그

| ID | 설명 | 상태 | 우선순위 |
|----|------|------|----------|
| - | 현재 알려진 이슈 없음 | - | - |

---

## 변경 이력

### 2026-01-24 (오후)

**Phase 8 & 9 추가 기능 완료**

#### PDF 미리보기 (Phase 8)
- `FileAttachmentNode.tsx` - PDF.js 동적 import, 미리보기 기능 추가
- 미리보기 버튼, 캔버스 렌더링, 페이지 네비게이션
- 로딩/에러/미설치 상태 표시
- `pdfjs-dist` optional peer dependency 추가
- 라이트/다크 모드 CSS 스타일

#### DOMPurify HTML Sanitizer (Phase 9)
- `packages/core/src/security/html-sanitizer.ts` 생성
- `configureDOMPurify()`, `sanitizeHtml()`, `sanitizeHtmlWithDetails()` 함수
- `createSanitizer()`, `containsDangerousHtml()` 유틸리티
- `dompurify` optional peer dependency 추가
- 보안 문서 업데이트 (`docs/SECURITY.md`)

---

### 2026-01-24

**미완료 선택기능 완료**

#### 이미지 업로드 플레이스홀더 (스켈레톤 UI)
- `image-extension.ts` - `uploading`, `uploadProgress`, `fileName` 속성 추가
- `ImageNode.tsx` - 업로드 중 스켈레톤 UI 표시 (애니메이션 아이콘, 파일명, 진행바, 퍼센트)
- `Editor.tsx` - placeholder 노드 삽입 → 진행률 업데이트 → 완료 시 실제 이미지로 교체
- `globals.css` - 업로드 플레이스홀더 스타일 (라이트/다크 모드)

#### 이전 세션에서 완료
- Alt 텍스트 인라인 편집 UI (window.prompt 제거)
- 테이블 셀 배경색 선택 (9가지 컬러 프리셋)
- 상대 URL 지원 (SSRF 검증에서 `/uploads/...` 허용)

---

### 2026-01-23 (오후 5)

**Phase 11 완료: 4개 노드 추가**

#### EnvBlockNode (환경 변수 블록)
- `packages/react/src/components/EnvBlockNode/` 디렉토리 생성
- 환경 변수 키-값 쌍 관리
- 값 마스킹/표시 토글 (눈 아이콘)
- 변수 추가/삭제 기능
- 복사 버튼 (`.env` 형식)
- 라이트/다크 모드 지원
- 슬래시 명령어: `/env`, `/environment`, `/variable` 등

#### GistNode (GitHub Gist 임베드)
- `packages/react/src/components/GistNode/` 디렉토리 생성
- Gist URL 입력 → 파싱 → iframe 렌더링
- Gist API로 메타데이터 조회 (파일명 등)
- GitHub에서 열기 버튼
- URL 수정 기능
- 슬래시 명령어: `/gist`, `/github` 등

#### DiffBlockNode (코드 Diff 블록)
- `packages/react/src/components/DiffBlockNode/` 디렉토리 생성
- diff 형식 파싱 (+/- 라인)
- 추가/삭제 라인 색상 표시 (초록/빨강)
- 통계 표시 (추가 X개, 삭제 Y개)
- 파일명 입력 지원
- 라인 넘버 표시
- 슬래시 명령어: `/diff`, `/compare` 등

#### FootnoteNode (각주 블록)
- `packages/react/src/components/FootnoteNode/` 디렉토리 생성
- 번호 자동 매김 ([1], [2], ...)
- 각주 추가/삭제 기능
- 편집/표시 모드 전환
- 슬래시 명령어: `/footnote`, `/note` 등

#### 파일 수정
- `packages/react/src/components/index.ts` - 4개 노드 export 추가
- `packages/react/src/components/Editor.tsx` - 확장 및 슬래시 명령어 추가
- `packages/react/src/locales/types.ts` - 4개 locale 타입 추가
- `packages/react/src/locales/en.ts` - 영어 번역 추가
- `packages/react/src/locales/ko.ts` - 한국어 번역 추가
- `apps/demo/src/app/globals.css` - 850+ 라인 CSS 스타일 추가 (라이트/다크)

---

### 2026-01-23 (오후 4)

**Phase 11: 코드블록 라인 하이라이트 구현**

#### 기능
- 라인 하이라이트 기능 추가 (예: 1,3-5,7 형식)
- 범위 지원 (3-5 → 3, 4, 5)
- 하이라이트 버튼 및 입력 필드
- 하이라이트된 라인에 배경색 표시
- 하이라이트된 라인 번호 강조
- 키보드 지원 (Enter로 확인, Escape로 취소)

#### 파일 수정
- `packages/react/src/components/Editor.tsx` - `highlightedLines` attribute 추가
- `packages/react/src/components/CodeBlock.tsx` - 하이라이트 UI 및 로직 전체 재작성
- `apps/demo/src/app/globals.css` - 하이라이트 관련 CSS 스타일 추가

---

### 2026-01-23 (오후 3)

**Phase 11: ChangelogNode 구현**

#### ChangelogNode 신규 생성
- `packages/react/src/components/ChangelogNode/` 디렉토리 생성
- `ChangelogNode.tsx` - React 컴포넌트 (편집/표시 모드)
- `changelog-extension.ts` - Tiptap Node 확장
- `index.ts` - exports

#### 기능
- Keep a Changelog 형식 지원
- 버전 번호, 릴리스 날짜 입력
- 4가지 변경 타입: Added, Changed, Fixed, Removed
- 타입별 색상 배지 및 아이콘
- 변경 항목 추가/삭제 기능
- 편집/표시 모드 전환 (클릭하여 편집)
- 표시 모드에서 타입별 그룹화
- Enter로 항목 추가, Ctrl+Enter로 저장, Escape로 취소
- 라이트/다크 모드 지원
- 슬래시 명령어: `/changelog`, `/version`, `/release` 등으로 검색

#### 파일 수정
- `packages/react/src/components/index.ts` - ChangelogNode export 추가
- `packages/react/src/components/Editor.tsx` - 슬래시 명령어 및 확장 설정
- `packages/react/src/locales/types.ts` - ChangelogNodeLocale 타입 추가
- `packages/react/src/locales/en.ts` - 영어 로케일
- `packages/react/src/locales/ko.ts` - 한국어 로케일
- `apps/demo/src/app/globals.css` - 스타일 (라이트/다크 모드, 480+ 라인)

---

### 2026-01-23 (오후 2)

**Phase 11: OsCommandNode 구현**

#### OsCommandNode 신규 생성
- `packages/react/src/components/OsCommandNode/` 디렉토리 생성
- `OsCommandNode.tsx` - React 컴포넌트 (탭 기반 OS별 명령어)
- `os-command-extension.ts` - Tiptap Node 확장
- `index.ts` - exports

#### 기능
- 3개의 OS 탭: macOS, Linux, Windows
- 각 탭별 명령어 입력/표시
- 탭 클릭으로 OS 전환
- 현재 선택된 탭의 복사 버튼
- 편집/표시 모드 전환 (클릭하여 편집)
- OS별 아이콘 (Apple, Linux, Windows)
- OS별 프롬프트 문자 ($ / >)
- 라이트/다크 모드 지원
- 슬래시 명령어: `/os`, `/command`, `/oscommand` 등으로 검색
- 키보드 단축키: Ctrl+1/2/3으로 탭 전환

#### 파일 수정
- `packages/react/src/components/index.ts` - OsCommandNode export 추가
- `packages/react/src/components/Editor.tsx` - 슬래시 명령어 및 확장 설정
- `packages/react/src/locales/types.ts` - OsCommandNodeLocale 타입 추가
- `packages/react/src/locales/en.ts` - 영어 로케일
- `packages/react/src/locales/ko.ts` - 한국어 로케일
- `apps/demo/src/app/globals.css` - 스타일 (라이트/다크 모드, 190+ 라인)

#### 코드 리뷰 및 버그 수정
1. **useEffect 의존성 경고**
   - ESLint 주석 추가로 의도적 빈 배열임을 명시
   - `// eslint-disable-next-line react-hooks/exhaustive-deps`

2. **중복 조건문 수정**
   - Before: `if (e.key === 'Enter' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey)))`
   - After: `if (e.key === 'Enter')`

3. **handleBlur 메모리 누수 수정**
   - `blurTimeoutRef` 추가
   - cleanup useEffect에서 타이머 정리 추가
   - 기존 타이머 정리 후 새로 설정하도록 수정

4. **Linux 아이콘 교체**
   - GitHub 스타일 아이콘에서 더 적절한 아이콘으로 변경

---

### 2026-01-23 (오후)

**Phase 11: ErrorMessageNode 구현**

#### ErrorMessageNode 신규 생성
- `packages/react/src/components/ErrorMessageNode/` 디렉토리 생성
- `ErrorMessageNode.tsx` - React 컴포넌트 (편집/표시 모드)
- `error-message-extension.ts` - Tiptap Node 확장
- `index.ts` - exports

#### 기능
- 4가지 메시지 타입: Error, Warning, Info, Success
- 편집 모드: 제목(선택), 메시지 입력
- 표시 모드: 아이콘, 제목, 메시지 표시
- 선택 시 타입 변경 툴바
- 슬래시 명령어: `/error`, `/warning`, `/alert`, `/경고` 등으로 검색
- 라이트/다크 모드 지원

#### 파일 수정
- `packages/react/src/components/index.ts` - ErrorMessageNode export 추가
- `packages/react/src/components/Editor.tsx` - 슬래시 명령어 및 확장 설정
- `packages/react/src/locales/types.ts` - ErrorMessageNodeLocale 타입 추가
- `packages/react/src/locales/en.ts` - 영어 로케일
- `packages/react/src/locales/ko.ts` - 한국어 로케일
- `apps/demo/src/app/globals.css` - 스타일 (라이트/다크 모드)

#### 버그 수정 (코드 리뷰)
- `hint` 로케일 문자열 수정: "Click to edit" → "Ctrl+Enter to confirm, Escape to cancel"
- `data-type` 속성 충돌 수정: 메시지 타입을 `data-message-type`으로 변경

---

**라이트/다크 모드 테마 토글 구현** (이전 세션)

#### 데모 앱 테마 기능
- `apps/demo/src/app/page.tsx` - 테마 상태, localStorage 저장, 시스템 설정 감지
- `apps/demo/tailwind.config.js` - `darkMode: ['selector', '[data-theme="dark"]']` 설정
- `apps/demo/src/app/globals.css` - 500+ 라인 다크모드 CSS 스타일

#### 커밋
- `c7808ea`, `0081e24` - 테마 토글 구현
- `e51f1a5` - EditorWrapper 로딩 상태 다크모드 수정

---

### 2026-01-23 (오전)

**Phase 9: 보안 강화 구현**

#### Core 보안 모듈 생성
- `packages/core/src/security/` 디렉토리 생성
- `types.ts` - 타입 정의 (UrlValidationResult, SsrfCheckResult 등)
- `url-validator.ts` - URL 검증 함수 (isSafeLinkUrl, isSafeImageUrl, normalizeUrl, sanitizeUrl)
- `ssrf-guard.ts` - SSRF 방지 함수 (checkSsrf, isPrivateIP, isLocalhost, normalizeIPv4)
- `index.ts` - 모든 보안 유틸리티 export

#### 컴포넌트 보안 강화
- `BubbleMenu.tsx` - 링크 URL 검증 추가 (javascript:, vbscript:, data: 차단)
- `ImageNode.tsx` - SSRF 검증 추가 (사설 IP, localhost, 클라우드 메타데이터 차단)
- `BookmarkNode.tsx` - 중복 isSafeUrl 제거, core 모듈 사용
- `FileAttachmentNode.tsx` - 중복 isSafeUrl 제거, core 모듈 사용
- `EmbedNode.tsx` - iframe sandbox 속성 추가

#### 보안 리뷰 및 추가 강화 (CVE-2024-56412 대응)
- `sanitizeUrl()` 함수 추가 - 제어 문자 제거 (0x00-0x1F, 0x7F)
  - `java\tscript:alert(1)`, `java\x00script:alert(1)` 같은 우회 공격 방지
- `normalizeIPv4()` 함수 추가 - 다양한 IP 표기법 정규화
  - 10진수: `2130706433` → `127.0.0.1`
  - 16진수: `0x7f000001` → `127.0.0.1`
  - 8진수: `0177.0.0.1` → `127.0.0.1`
  - IPv6 매핑: `::ffff:127.0.0.1` → `127.0.0.1`
- 모든 URL 검증 함수에 sanitizeUrl() 적용

#### 문서화
- `docs/SECURITY.md` 생성 (CSP 헤더 가이드, URL 검증, SSRF 방지, 파일 업로드 체크리스트)

#### 로케일 업데이트
- `unsafeUrlError` 메시지 추가 (한국어/영어)
- `image.invalidUrl` 메시지 추가 (한국어/영어)

---

**프로젝트 분석 및 버그 수정**

#### 빌드 에러 수정
- `FileAttachmentNode.tsx` import 경로 수정 (`contexts` → `context`)
- `FileAttachmentNodeProps` 타입 export 추가
- `BookmarkNode`, `EmbedNode`, `MathNode`의 미사용 `isMounted` 변수 제거

#### UX 개선
- 슬래시 메뉴 스크롤 시 자동 닫힘 기능 추가
- scroll, wheel, touchmove 이벤트 감지로 외부 스크롤 시 메뉴 닫힘
- 메뉴 내부 스크롤(아이템 목록)은 유지
- 커밋: `1864014` fix(react): Close slash menu on scroll and fix build errors

#### Phase 8 완료 확인
- FileAttachmentNode 이미 구현되어 있음 확인
- 파일 타입별 아이콘, 다운로드 버튼, 캡션 지원

---

### 2026-01-22

**Phase 7: 이미지 및 커스텀 노드 대부분 완료**

#### ImageNode 구현
- `ImageNode` 커스텀 노드뷰 (NodeView)
- 이미지 리사이즈 (드래그 핸들), 정렬 (좌/중/우), 캡션 편집
- 드래그앤드롭, 붙여넣기, 파일 선택 업로드
- 업로드 진행률 콜백 (`onProgress`), 에러 핸들러
- Base64 폴백 (서버 없이 동작)

#### EmbedNode 구현
- YouTube, Vimeo, Twitter/X, CodePen, CodeSandbox 임베드 지원

#### CalloutNode 구현
- 6가지 색상 테마 (info, warning, error, success, tip, note)

#### ToggleNode 구현
- 접기/펼치기 기능, 중첩 콘텐츠 지원

#### BookmarkNode 구현
- 링크 메타데이터 가져오기, 미리보기 카드
- XSS 방지 (javascript: URL 차단)

#### MathNode 구현
- KaTeX 렌더링, LaTeX 문법 지원
- 커밋: `1bba32f` feat(math): Add LaTeX equation block with KaTeX rendering

#### 데모 앱 개선
- 사용 가이드 사이드바 (슬래시 명령어, 단축키, 마크다운)
- 언어 토글 (한국어/영어)
- JSON/Markdown 출력 뷰어
- Hydration 오류 수정 (dynamic import with ssr: false)
- TaskList 체크박스 정렬 수정

---

### 2026-01-21 (오후)

**Phase 5: 다국어 지원 (i18n) 완료**
- `ZmEditorLocale` 타입 시스템 설계 및 구현
- 영어(`enLocale`), 한국어(`koLocale`) 로케일 정의
- Editor, BubbleMenu, SlashMenu 컴포넌트에 locale prop 적용
- `@zm-editor/react`에서 locales export
- 커밋: `adba6d3` feat(react): Add i18n support with locale system

**Phase 6: 테이블 기능 완료**
- `@tiptap/extension-table` 관련 패키지 설치 (table, table-row, table-header, table-cell)
- Table, TableRow, TableHeader, TableCell 확장 추가
- `/table` 슬래시 명령어 (3x3 테이블 + 헤더 행)
- `TableBubbleMenu` 컴포넌트 생성 (행/열 추가·삭제, 셀 병합·분할, 헤더 토글, 테이블 삭제)
- 테이블 CSS 스타일링 (선택 셀 하이라이트, 열 리사이즈 핸들)
- i18n 지원 (영어/한국어)
- 커밋: `839aa00` feat(table): Add table support with bubble menu

### 2026-01-21 (오전)

**코드 작업**
- Phase 1~4 완료 (핵심 에디터 기능)
- 모노레포 구조, Tiptap 에디터, 슬래시 명령어, 버블 메뉴
- 코드블록 언어 선택 UI + 신택스 하이라이팅

**문서화 작업**
- 프로젝트 문서 생성 (PROJECT.md, PROGRESS.md, SESSION.md, CLAUDE.md)
- 요구사항 정의:
  - 다국어 지원 (i18n) - Phase 5
  - 테이블/이미지/파일 업로드 - Phase 6~8
  - 보안 (XSS, 파일 검증, SSRF) - Phase 9
  - 개발자 기능 (KaTeX, Mermaid, Callout, API 블록, 터미널 블록 등) - Phase 10~12
  - 다이어그램/캔버스 모듈 (@zm-editor/canvas) - Phase 16
- Phase 5~16 로드맵 확정
