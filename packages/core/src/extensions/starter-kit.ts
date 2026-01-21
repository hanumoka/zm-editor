import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import { common, createLowlight } from 'lowlight';

// lowlight 인스턴스 생성 (common languages 포함)
const lowlight = createLowlight(common);

export interface ZmStarterKitOptions {
  placeholder?: string;
  characterLimit?: number;
}

/**
 * zm-editor 기본 확장 세트
 *
 * Notion-like 에디터에 필요한 모든 기본 확장을 포함합니다.
 */
export function createStarterExtensions(options: ZmStarterKitOptions = {}) {
  const { placeholder = "Type '/' for commands...", characterLimit = 50000 } =
    options;

  return [
    // 기본 텍스트 편집 (마크다운 단축키 포함)
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
        HTMLAttributes: {
          class: 'zm-heading',
        },
      },
      bulletList: {
        HTMLAttributes: {
          class: 'zm-bullet-list',
        },
      },
      orderedList: {
        HTMLAttributes: {
          class: 'zm-ordered-list',
        },
      },
      listItem: {
        HTMLAttributes: {
          class: 'zm-list-item',
        },
      },
      blockquote: {
        HTMLAttributes: {
          class: 'zm-blockquote',
        },
      },
      codeBlock: false, // CodeBlockLowlight 사용
      horizontalRule: false, // 커스텀 HorizontalRule 사용
      dropcursor: {
        color: '#3b82f6',
        width: 2,
      },
    }),

    // 코드 블록 (신택스 하이라이팅)
    CodeBlockLowlight.configure({
      lowlight,
      HTMLAttributes: {
        class: 'zm-code-block',
      },
    }),

    // 구분선
    HorizontalRule.configure({
      HTMLAttributes: {
        class: 'zm-horizontal-rule',
      },
    }),

    // 텍스트 스타일
    Underline,
    TextStyle,
    Color,
    Highlight.configure({
      multicolor: true,
      HTMLAttributes: {
        class: 'zm-highlight',
      },
    }),

    // 링크
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'zm-link',
      },
    }),

    // 이미지
    Image.configure({
      allowBase64: true,
      HTMLAttributes: {
        class: 'zm-image',
      },
    }),

    // 체크리스트
    TaskList.configure({
      HTMLAttributes: {
        class: 'zm-task-list',
      },
    }),
    TaskItem.configure({
      nested: true,
      HTMLAttributes: {
        class: 'zm-task-item',
      },
    }),

    // 플레이스홀더
    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === 'heading') {
          return `Heading ${node.attrs.level}`;
        }
        return placeholder;
      },
      includeChildren: true,
    }),

    // 글자 수 제한
    CharacterCount.configure({
      limit: characterLimit,
    }),
  ];
}

export {
  StarterKit,
  Underline,
  TextStyle,
  Color,
  Highlight,
  Link,
  Image,
  TaskList,
  TaskItem,
  Placeholder,
  CharacterCount,
  CodeBlockLowlight,
  HorizontalRule,
};
