import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TocNode } from './TocNode';

export interface TocNodeOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    toc: {
      /**
       * Insert a table of contents block
       */
      setToc: () => ReturnType;
    };
  }
}

/**
 * Toc Extension - 자동 목차 생성 노드
 *
 * 에디터 내의 제목(h1-h3)을 자동으로 수집하여 목차를 렌더링합니다.
 */
export const Toc = Node.create<TocNodeOptions>({
  name: 'toc',

  group: 'block',

  // atom: true - 자식 콘텐츠 없음 (자동 생성)
  atom: true,

  // 드래그 가능
  draggable: true,

  // 선택 가능
  selectable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'zm-toc',
      },
    };
  },

  addAttributes() {
    return {
      // 표시할 최대 레벨 (1-6, 기본: 3)
      maxLevel: {
        default: 3,
        parseHTML: (element) => parseInt(element.getAttribute('data-max-level') || '3', 10),
        renderHTML: (attributes) => ({
          'data-max-level': attributes.maxLevel,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-toc]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-toc': '',
      }),
    ];
  },

  addCommands() {
    return {
      setToc:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              maxLevel: 3,
            },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(TocNode);
  },
});

export default Toc;
