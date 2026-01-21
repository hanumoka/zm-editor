import type { ZmEditorLocale } from './types';

/**
 * 한국어 로케일
 */
export const koLocale: ZmEditorLocale = {
  editor: {
    placeholder: "'/'를 입력하여 명령어 사용...",
    loading: '에디터 로딩 중...',
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
    },
  },
  bubbleMenu: {
    bold: '굵게',
    italic: '기울임',
    underline: '밑줄',
    strikethrough: '취소선',
    code: '코드',
    highlight: '강조',
    link: '링크',
  },
  dialogs: {
    linkUrlPrompt: 'URL을 입력하세요',
  },
};
