import type { ZmEditorLocale } from './types';

/**
 * 한국어 로케일
 */
export const koLocale: ZmEditorLocale = {
  editor: {
    placeholder: "'/'를 입력하여 명령어 사용...",
    loading: '에디터 로딩 중...',
    uploading: '이미지 업로드 중...',
  },
  slashMenu: {
    noResults: '검색 결과 없음',
    commands: {
      text: {
        title: '텍스트',
        description: '일반 텍스트 문단',
      },
      heading1: {
        title: '제목 1',
        description: '큰 섹션 제목',
      },
      heading2: {
        title: '제목 2',
        description: '중간 섹션 제목',
      },
      heading3: {
        title: '제목 3',
        description: '작은 섹션 제목',
      },
      bulletList: {
        title: '글머리 기호 목록',
        description: '순서 없는 목록',
      },
      numberedList: {
        title: '번호 매기기 목록',
        description: '순서 있는 목록',
      },
      taskList: {
        title: '작업 목록',
        description: '체크박스가 있는 목록',
      },
      quote: {
        title: '인용구',
        description: '인용 블록',
      },
      codeBlock: {
        title: '코드 블록',
        description: '구문 강조가 있는 코드',
      },
      divider: {
        title: '구분선',
        description: '가로 구분선',
      },
      table: {
        title: '테이블',
        description: '표 삽입',
      },
      image: {
        title: '이미지',
        description: '이미지 업로드 또는 삽입',
      },
      file: {
        title: '파일',
        description: '파일 첨부',
      },
      embed: {
        title: '임베드',
        description: 'YouTube, Vimeo, Twitter, CodePen',
      },
      callout: {
        title: '콜아웃',
        description: '아이콘이 있는 강조 박스',
      },
      toggle: {
        title: '토글',
        description: '접기/펼치기 가능한 블록',
      },
      bookmark: {
        title: '북마크',
        description: '링크 미리보기 카드',
      },
      math: {
        title: '수식',
        description: 'LaTeX 수학 수식 블록',
      },
      toc: {
        title: '목차',
        description: '자동 생성 제목 목록',
      },
      terminal: {
        title: '터미널',
        description: '명령어와 출력이 있는 CLI 블록',
      },
      apiBlock: {
        title: 'API',
        description: 'HTTP 요청 및 응답 블록',
      },
      mermaid: {
        title: 'Mermaid',
        description: '플로우차트, 시퀀스 등 다이어그램',
      },
      errorMessage: {
        title: '에러 메시지',
        description: '에러, 경고, 정보 메시지 표시',
      },
      osCommand: {
        title: 'OS 명령어',
        description: 'OS별 명령어 탭 (macOS/Linux/Windows)',
      },
    },
  },
  bubbleMenu: {
    bold: '굵게',
    italic: '기울임',
    underline: '밑줄',
    strikethrough: '취소선',
    code: '코드',
    keyboard: '키보드',
    highlight: '강조',
    link: '링크',
  },
  tableBubbleMenu: {
    addColumnBefore: '왼쪽에 열 추가',
    addColumnAfter: '오른쪽에 열 추가',
    deleteColumn: '열 삭제',
    addRowBefore: '위에 행 추가',
    addRowAfter: '아래에 행 추가',
    deleteRow: '행 삭제',
    deleteTable: '테이블 삭제',
    mergeCells: '셀 병합',
    splitCell: '셀 분할',
    toggleHeaderColumn: '헤더 열 전환',
    toggleHeaderRow: '헤더 행 전환',
    toggleHeaderCell: '헤더 셀 전환',
  },
  dialogs: {
    linkUrlPrompt: 'URL을 입력하세요',
    unsafeUrlError: '안전하지 않은 URL입니다. http, https, mailto, tel 링크만 허용됩니다.',
  },
  nodes: {
    bookmark: {
      placeholder: '링크를 붙여넣어 북마크 생성...',
      editUrl: 'URL 수정',
      openInNewTab: '새 탭에서 열기',
      addCaption: '캡션 추가...',
    },
    embed: {
      placeholder: 'YouTube, Vimeo, CodePen, CodeSandbox URL 붙여넣기...',
      hint: '지원: YouTube, Vimeo, Twitter/X, CodePen, CodeSandbox',
      editUrl: 'URL 수정',
      openInNewTab: '새 탭에서 열기',
      addCaption: '캡션 추가...',
      viewOnTwitter: 'Twitter/X에서 보기',
      unableToEmbed: '이 URL을 임베드할 수 없습니다',
    },
    math: {
      label: '수학 수식',
      placeholder: 'LaTeX 입력 (예: E = mc^2)',
      hint: 'Ctrl+Enter로 확인, Escape로 취소',
      edit: '수식 수정',
    },
    fileAttachment: {
      download: '다운로드',
      addCaption: '캡션 추가...',
      uploadingFile: '파일 업로드 중...',
    },
    image: {
      invalidUrl: '유효하지 않은 이미지 URL입니다',
    },
    terminal: {
      title: '터미널',
      commandPlaceholder: '명령어 입력...',
      output: '출력',
      outputPlaceholder: '명령어 출력 (선택)...',
      copyCommand: '명령어 복사',
      copyOutput: '출력 복사',
      copied: '복사됨!',
      clickToEdit: '클릭하여 수정',
    },
    apiBlock: {
      urlPlaceholder: '/api/endpoint',
      requestBody: '요청 본문',
      responseBody: '응답',
      requestPlaceholder: '{\n  "key": "value"\n}',
      responsePlaceholder: '{\n  "data": []\n}',
      copy: '복사',
      copied: '복사됨!',
    },
    mermaid: {
      label: 'Mermaid 다이어그램',
      placeholder: 'Mermaid 다이어그램 코드 입력...\n\n예시:\ngraph TD\n    A[시작] --> B{결정}\n    B -->|예| C[확인]\n    B -->|아니오| D[취소]',
      hint: 'Ctrl+Enter로 확인, Escape로 취소',
      edit: '다이어그램 수정',
    },
    errorMessage: {
      titlePlaceholder: '제목 (선택)',
      messagePlaceholder: '메시지 입력...',
      hint: 'Ctrl+Enter로 확인, Escape로 취소',
      edit: '메시지 수정',
    },
    osCommand: {
      macos: 'macOS',
      linux: 'Linux',
      windows: 'Windows',
      commandPlaceholder: '명령어 입력...',
      copyCommand: '명령어 복사',
      copied: '복사됨!',
      clickToEdit: '클릭하여 수정',
    },
  },
};
