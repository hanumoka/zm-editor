# zm-editor 세션 상황

> **이 파일은 Claude 세션 시작 시 자동으로 읽어야 합니다.**
>
> 최종 업데이트: 2026-01-21

---

## 현재 프로젝트 상태

| 항목 | 상태 |
|------|------|
| **현재 Phase** | Phase 4 완료, Phase 5 대기 |
| **빌드 상태** | 성공 ✅ |
| **Git 상태** | 커밋 필요 (문서 + 코드블록 기능) |
| **개발 서버** | 포트 3100 |
| **문서화** | 전체 요구사항 정의 완료 ✅ |

---

## 완료된 Phase

### Phase 1~4: 핵심 기능 ✅

- 모노레포 구조 (pnpm workspaces + Turbo)
- Tiptap 기반 에디터 컴포넌트
- 슬래시 명령어, 버블 메뉴
- 코드블록 + 언어 선택 UI + 신택스 하이라이팅

### 문서화 작업 ✅

| 문서 | 내용 |
|------|------|
| `docs/PROJECT.md` | 프로젝트 관리, 기능 요구사항, 보안 요구사항 |
| `docs/PROGRESS.md` | Phase 1~16 로드맵, 진행상황 추적 |
| `docs/SESSION.md` | 세션 컨텍스트 (이 파일) |
| `CLAUDE.md` | Claude Code 가이드 |

### 정의된 요구사항 ✅

1. **다국어 지원 (i18n)** - 한국어/영어
2. **테이블 기능** - 생성, 편집, 병합
3. **이미지 업로드** - 드래그앤드롭, 리사이즈
4. **파일 업로드** - 첨부 파일, PDF 미리보기
5. **보안** - XSS 방지, 파일 검증, SSRF 방지
6. **개발자 기능 (기본)** - KaTeX, Mermaid, Callout, 코드블록 고급
7. **개발자 기능 (추가)** - API 블록, 터미널 블록, Gist 임베드, Diff 등
8. **다이어그램 모듈** - @zm-editor/canvas (draw.io 스타일)

---

## 다음 작업

### 즉시 필요
- [ ] Git 커밋 (문서 + 코드)

### Phase 5: 다국어 지원 (i18n)
- [ ] `ZmEditorLocale` 인터페이스 정의
- [ ] `enLocale`, `koLocale` 구현
- [ ] 컴포넌트에 locale prop 적용

### Phase 6: 테이블 기능
- [ ] `@tiptap/extension-table` 설치
- [ ] 테이블 UI 및 버블 메뉴

---

## 전체 로드맵 요약

| Phase | 내용 | 상태 |
|-------|------|------|
| 1~4 | 핵심 에디터 기능 | ✅ 완료 |
| 5 | 다국어 지원 (i18n) | 📋 대기 |
| 6 | 테이블 기능 | 📋 대기 |
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

## 주요 파일 위치

### 핵심 코드

| 파일 | 설명 |
|------|------|
| `packages/core/src/extensions/starter-kit.ts` | Tiptap 확장 설정 |
| `packages/core/src/extensions/slash-command.ts` | 슬래시 명령어 |
| `packages/react/src/components/Editor.tsx` | 메인 에디터 컴포넌트 |
| `packages/react/src/components/CodeBlock.tsx` | 코드블록 (언어 선택 UI) |
| `packages/react/src/components/BubbleMenu.tsx` | 버블 메뉴 |

### 데모 앱

| 파일 | 설명 |
|------|------|
| `apps/demo/src/app/page.tsx` | 데모 페이지 |
| `apps/demo/src/app/globals.css` | 스타일 + 신택스 하이라이팅 |

---

## 세션 복원 명령어

```bash
# 1. 개발 서버 상태 확인
curl -s -o /dev/null -w "%{http_code}" http://localhost:3100

# 2. Git 상태 확인
cd C:/Users/amagr/project/zm-editor && git status

# 3. 빌드 확인 (필요시)
cd C:/Users/amagr/project/zm-editor && pnpm build
```

---

## 프로젝트 정보

- **경로**: `C:/Users/amagr/project/zm-editor/`
- **GitHub**: `git@github-personal:hanumoka/zm-editor.git`
- **라이센스**: MIT
- **데모 서버**: http://localhost:3100
