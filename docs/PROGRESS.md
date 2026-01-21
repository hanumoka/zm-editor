# zm-editor 진행상황

> 최종 업데이트: 2026-01-21

## 현재 버전

- **버전**: 0.1.0 (개발 중)
- **상태**: Alpha
- **완료**: Phase 1~6
- **다음**: Phase 7 (이미지 업로드)

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
| 7 | 이미지 업로드 | 📋 대기 |
| 8 | 파일 업로드/첨부 | 📋 대기 |
| 9 | 보안 강화 | 📋 대기 |
| 10 | 개발자 기능 (필수) | 📋 대기 |
| 11 | 개발자 기능 (권장) | 📋 대기 |
| 12 | 개발자 기능 (선택) | 📋 대기 |
| 13 | 안정화 및 최적화 | 📋 대기 |
| 14 | npm 배포 준비 | 📋 대기 |
| 15 | 추가 기능 (선택) | 📋 대기 |
| 16 | 다이어그램/캔버스 모듈 | 📋 대기 |

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
- [ ] 셀 배경색 선택 (Phase 6.1로 이동)

---

## 예정된 작업

### Phase 7: 이미지 업로드

- [ ] `@tiptap/extension-file-handler` 설정
- [ ] 드래그 앤 드롭 업로드
- [ ] 복사/붙여넣기 업로드
- [ ] 업로드 진행률 UI
- [ ] 이미지 플레이스홀더 (업로드 중)
- [ ] 이미지 리사이즈 핸들
- [ ] 이미지 캡션 (커스텀 노드뷰)
- [ ] 이미지 정렬 (좌/중/우)
- [ ] Alt 텍스트 편집 UI

### Phase 8: 파일 업로드/첨부

- [ ] `FileAttachment` 커스텀 노드 생성
- [ ] 파일 타입별 아이콘 세트
- [ ] 파일 드래그 앤 드롭
- [ ] 파일 정보 표시 (파일명, 크기, 타입)
- [ ] 파일 다운로드 버튼
- [ ] PDF 미리보기 (PDF.js 연동)
- [ ] 슬래시 명령어에 "File" 추가

### Phase 9: 보안 강화

- [ ] DOMPurify 통합
- [ ] HTML Sanitization 유틸 함수
- [ ] Link URL 검증 (`javascript:` 차단)
- [ ] 이미지 URL SSRF 방지
- [ ] 파일 업로드 검증 (백엔드 가이드)
- [ ] CSP 헤더 가이드 문서화
- [ ] 보안 테스트 케이스

### Phase 10: 개발자 친화적 기능 (필수)

- [ ] 코드블록 라인 넘버
- [ ] 코드블록 복사 버튼
- [ ] 마크다운 Export (`editor.getMarkdown()`)
- [ ] 마크다운 Import (`setContent` with markdown)
- [ ] Callout/Admonition 블록 (note, tip, warning, danger)
- [ ] 목차 (TOC) 자동 생성
- [ ] 터미널/CLI 블록 (명령어 + 출력 + 복사 버튼)
- [ ] API Request/Response 블록

### Phase 11: 개발자 친화적 기능 (권장)

- [ ] 수학 공식 (KaTeX) - `@tiptap/extension-mathematics`
- [ ] 다이어그램 (Mermaid) - 커스텀 노드뷰
- [ ] 접이식 블록 (`<details>`)
- [ ] `<kbd>` 태그 (키보드 단축키)
- [ ] 코드블록 파일명 표시
- [ ] 코드블록 라인 하이라이트
- [ ] GitHub Gist 임베드
- [ ] CodeSandbox 임베드
- [ ] 환경 변수 블록 (민감 정보 마스킹)
- [ ] Changelog 블록
- [ ] 각주 (Footnotes)
- [ ] 코드 Diff 블록
- [ ] 에러 메시지 블록
- [ ] OS별 명령어 탭 (macOS/Linux/Windows)

### Phase 12: 개발자 친화적 기능 (선택)

- [ ] 링크 미리보기 (OEmbed)
- [ ] StackBlitz/CodePen/Replit 임베드
- [ ] OpenAPI/Swagger 임베드
- [ ] GraphQL 쿼리 블록
- [ ] 내부 링크/앵커
- [ ] 용어 정의 (Glossary) - 팝오버
- [ ] 스택 트레이스 블록
- [ ] 로그 블록 (INFO/WARN/ERROR 색상)
- [ ] 버전 배지 / Since 태그
- [ ] 메타데이터 블록 (작성자, 난이도, 소요시간)
- [ ] PlantUML / D2 다이어그램

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

### Phase 16: 다이어그램/캔버스 모듈 (@zm-editor/canvas)

> draw.io, FigJam, Excalidraw 스타일의 다이어그램/화이트보드 기능
> 별도 프로젝트로 분리 가능하나 zm-editor 통합 필수

#### 16.1: 기반 구축
- [ ] `packages/canvas` 디렉토리 생성
- [ ] 기반 기술 선정 (Konva.js vs Fabric.js)
- [ ] 캔버스 렌더링 엔진 초기화
- [ ] 기본 캔버스 컴포넌트 (`CanvasEditor`)

#### 16.2: 기본 도형
- [ ] Rectangle, Ellipse, Diamond, Line, Arrow, Text

#### 16.3: 편집 기능
- [ ] 선택/이동, 리사이즈, 복사/붙여넣기, 실행 취소, 스냅 가이드

#### 16.4: 스타일링
- [ ] 채우기 색상, 선 색상/두께/스타일, 텍스트 서식

#### 16.5: 캔버스 컨트롤
- [ ] 무한 캔버스, 줌 인/아웃, 그리드 표시

#### 16.6: 내보내기/불러오기
- [ ] JSON 저장/불러오기, SVG/PNG 내보내기

#### 16.7: zm-editor 통합
- [ ] `CanvasNode` Tiptap 확장, `/diagram` 슬래시 명령어

---

## 이슈 및 버그

| ID | 설명 | 상태 | 우선순위 |
|----|------|------|----------|
| - | 현재 알려진 이슈 없음 | - | - |

---

## 변경 이력

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
