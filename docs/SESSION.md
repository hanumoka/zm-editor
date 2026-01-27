# zm-editor 세션 상황

> **이 파일은 Claude 세션 시작 시 자동으로 읽어야 합니다.**
>
> 최종 업데이트: 2026-01-27

---

## 현재 프로젝트 상태

| 항목 | 상태 |
|------|------|
| **현재 Phase** | Phase 13 일부 진행중, Phase 14 완료 ✅ |
| **npm 배포** | **완료** ✅ (v0.1.0) |
| **빌드 상태** | 성공 ✅ |
| **타입 체크** | 성공 ✅ |
| **Git 상태** | Clean |
| **개발 서버** | 포트 3100 (FE) |

### npm 패키지 (배포 완료) 🎉

| 패키지 | 버전 | npm |
|--------|------|-----|
| `@zm-editor/core` | 0.1.0 | https://www.npmjs.com/package/@zm-editor/core |
| `@zm-editor/react` | 0.1.0 | https://www.npmjs.com/package/@zm-editor/react |

```bash
# 설치 명령어
npm install @zm-editor/core @zm-editor/react
```

### 최근 완료 ✅

- **Phase 14: npm 배포 완료** ✅ (2026-01-27)
  - npm Organization 생성 (`@zm-editor`)
  - package.json 메타데이터 업데이트
  - README.md 작성
  - CHANGELOG.md 작성
  - .npmignore 설정
  - `@zm-editor/core@0.1.0` 배포
  - `@zm-editor/react@0.1.0` 배포

- **Mermaid 이슈 해결** ✅ (2026-01-27)
  - 구문 오류 시 orphan SVG가 document.body에 누적되는 문제 수정
  - `cleanupOrphanMermaidElements()` 함수 추가

- **pdfjs-dist 타입 선언 추가** ✅ (2026-01-27)
  - `packages/react/src/types/pdfjs-dist.d.ts` 생성
  - 빌드 오류 해결

---

## 완료된 Phase

### Phase 1~12: 모든 기능 구현 ✅

- 모노레포 구조, Tiptap 에디터, 슬래시 명령어 (35개), 버블 메뉴
- 코드블록 + 신택스 하이라이팅 (26개 언어)
- 다국어 지원 (한국어/영어)
- 테이블 (셀 병합/분할, 배경색)
- 이미지/파일 업로드, 커스텀 노드 28개
- 보안 강화 (XSS, SSRF 방지)
- 개발자 기능 (Mermaid, KaTeX, Terminal, API 블록 등)

### Phase 13: 안정화 및 최적화 (일부 완료)

- [x] 메모리 누수 수정
- [x] 접근성(a11y) 개선
- [x] 번들 크기 확인 (Core: 17.8KB, React: 79.8KB)
- [x] Mermaid orphan SVG 정리
- [ ] 성능 최적화 검증
- [ ] 다양한 브라우저 호환성 테스트

### Phase 14: npm 배포 준비 ✅ (완료)

- [x] npm 계정/Organization 생성
- [x] package.json 메타데이터 검토
- [x] README.md 작성
- [x] CHANGELOG.md 작성
- [x] .npmignore 설정
- [x] npm publish 완료
- [ ] GitHub Actions CI/CD (선택)

### Phase 15: 추가 기능 (선택) ✅

- [x] 이모지 선택기
- [x] 멘션 (@) 기능
- [x] 드래그 앤 드롭 블록 이동
- [x] 협업 편집 (Y.js 기반)

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
| 13 | 안정화 및 최적화 | 🔄 일부 완료 |
| **14** | **npm 배포 준비** | **✅ 완료** |
| 15 | 추가 기능 (선택) | ✅ 완료 |

---

## 남은 작업

### Phase 13 잔여 작업 (선택)
- [ ] 성능 최적화 검증
- [ ] 다양한 브라우저 호환성 테스트

### 선택적 개선
- [ ] Mermaid 다크모드 테마 동기화
- [ ] GitHub Actions CI/CD 자동 배포
- [ ] API 문서 자동 생성

---

## 구현된 슬래시 명령어 (35개)

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
| `/os` | OS별 명령어 탭 |
| `/changelog` | 버전 변경 이력 |
| `/env` | 환경 변수 블록 |
| `/gist` | GitHub Gist 임베드 |
| `/diff` | 코드 Diff 블록 |
| `/footnote` | 각주 블록 |
| `/log` | 로그 블록 |
| `/stacktrace` | 스택 트레이스 블록 |
| `/metadata` | 문서 메타데이터 |
| `/graphql` | GraphQL 쿼리 블록 |
| `/openapi` | OpenAPI/Swagger 임베드 |
| `/diagram` | PlantUML/D2 다이어그램 |
| `/emoji` | 이모지 선택기 |

---

## 세션 복원 명령어

```bash
# 1. 개발 서버 시작
cd C:/Users/amagr/project/zm-editor && pnpm dev

# 2. 빌드 확인
cd C:/Users/amagr/project/zm-editor && pnpm build

# 3. Git 상태 확인
cd C:/Users/amagr/project/zm-editor && git status
```

---

## 프로젝트 정보

- **경로**: `C:/Users/amagr/project/zm-editor/`
- **GitHub**: `git@github-personal:hanumoka/zm-editor.git`
- **npm**: `@zm-editor/core`, `@zm-editor/react`
- **라이센스**: MIT
- **데모 서버**: http://localhost:3100
