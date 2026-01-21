import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { MathNode } from './MathNode';

export interface MathOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    math: {
      /**
       * Insert a math block
       */
      setMath: (options?: { latex?: string; displayMode?: boolean }) => ReturnType;
    };
  }
}

/**
 * Math Extension - KaTeX를 이용한 수학 수식 렌더링
 */
export const Math = Node.create<MathOptions>({
  name: 'math',

  group: 'block',

  atom: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'zm-math',
      },
    };
  },

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-latex') || '',
        renderHTML: (attributes) => ({
          'data-latex': attributes.latex,
        }),
      },
      displayMode: {
        default: true,
        parseHTML: (element) => element.getAttribute('data-display-mode') !== 'false',
        renderHTML: (attributes) => ({
          'data-display-mode': attributes.displayMode ? 'true' : 'false',
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-math]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-math': '',
      }),
    ];
  },

  addCommands() {
    return {
      setMath:
        (options = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              latex: options.latex || '',
              displayMode: options.displayMode ?? true,
            },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathNode);
  },
});

export default Math;
