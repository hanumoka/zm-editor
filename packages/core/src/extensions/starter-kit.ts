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
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { common, createLowlight } from 'lowlight';

// HorizontalRule 확장에 draggable 속성 추가 및 선택 영역 확대
const CustomHorizontalRule = HorizontalRule.extend({
  draggable: true,

  // 더 넓은 선택 영역을 위한 래퍼 div 사용
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      {
        class: 'zm-horizontal-rule-wrapper',
        'data-type': 'horizontalRule',
      },
      ['hr', HTMLAttributes],
    ];
  },

  parseHTML() {
    return [
      { tag: 'hr' },
      { tag: 'div.zm-horizontal-rule-wrapper hr' },
    ];
  },
});

// TableCell 확장에 backgroundColor 속성 추가
const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor || null,
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) {
            return {};
          }
          return {
            style: `background-color: ${attributes.backgroundColor}`,
          };
        },
      },
    };
  },
});

// TableHeader도 동일하게 확장 (헤더 셀에도 배경색 지원)
const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor || null,
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) {
            return {};
          }
          return {
            style: `background-color: ${attributes.backgroundColor}`,
          };
        },
      },
    };
  },
});

// lowlight 인스턴스 생성 (common languages 포함)
const lowlight = createLowlight(common);

export interface ZmStarterKitOptions {
  placeholder?: string;
  characterLimit?: number;
  /** CodeBlock을 제외할지 여부 (React NodeView 사용 시) */
  excludeCodeBlock?: boolean;
  /** Table을 제외할지 여부 */
  excludeTable?: boolean;
  /** Image를 제외할지 여부 (React NodeView 사용 시) */
  excludeImage?: boolean;
}

// lowlight 인스턴스 export (React에서 커스텀 CodeBlock 사용 시 필요)
export { lowlight };

/**
 * zm-editor 기본 확장 세트
 *
 * Notion-like 에디터에 필요한 모든 기본 확장을 포함합니다.
 */
export function createStarterExtensions(options: ZmStarterKitOptions = {}) {
  const {
    placeholder = "Type '/' for commands...",
    characterLimit = 50000,
    excludeCodeBlock = false,
    excludeTable = false,
    excludeImage = false,
  } = options;

  const extensions = [
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

    // 구분선 (draggable 지원)
    CustomHorizontalRule.configure({
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
      placeholder: ({ node, editor }) => {
        // 테이블 내부에서는 placeholder 표시하지 않음
        if (editor.isActive('table')) {
          return '';
        }
        if (node.type.name === 'heading') {
          return `Heading ${node.attrs.level}`;
        }
        return placeholder;
      },
      includeChildren: false, // 중첩 노드에서 placeholder 비활성화
      showOnlyCurrent: true, // 현재 포커스된 노드에만 placeholder 표시
    }),

    // 글자 수 제한
    CharacterCount.configure({
      limit: characterLimit,
    }),
  ];

  // CodeBlock 포함 여부
  if (!excludeCodeBlock) {
    extensions.splice(1, 0, CodeBlockLowlight.configure({
      lowlight,
      HTMLAttributes: {
        class: 'zm-code-block',
      },
    }));
  }

  // Image 포함 여부 (React NodeView 사용 시 제외)
  if (!excludeImage) {
    extensions.push(
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'zm-image',
        },
      })
    );
  }

  // Table 포함 여부
  if (!excludeTable) {
    extensions.push(
      Table.configure({
        resizable: true,
        allowTableNodeSelection: true,
        HTMLAttributes: {
          class: 'zm-table',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'zm-table-row',
        },
      }),
      CustomTableHeader.configure({
        HTMLAttributes: {
          class: 'zm-table-header',
        },
      }),
      CustomTableCell.configure({
        HTMLAttributes: {
          class: 'zm-table-cell',
        },
      }),
    );
  }

  return extensions;
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
  Table,
  TableRow,
  CustomTableHeader as TableHeader,
  CustomTableCell as TableCell,
};
