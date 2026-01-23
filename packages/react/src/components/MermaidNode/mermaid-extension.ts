import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { MermaidNode } from './MermaidNode';

export interface MermaidOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mermaid: {
      /**
       * Insert a mermaid diagram block
       */
      setMermaid: (options?: { code?: string }) => ReturnType;
    };
  }
}

/**
 * Mermaid Extension - Mermaid.js를 이용한 다이어그램 렌더링
 */
export const Mermaid = Node.create<MermaidOptions>({
  name: 'mermaid',

  group: 'block',

  atom: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'zm-mermaid',
      },
    };
  },

  addAttributes() {
    return {
      code: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-code') || '',
        renderHTML: (attributes) => ({
          'data-code': attributes.code,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-mermaid]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-mermaid': '',
      }),
    ];
  },

  addCommands() {
    return {
      setMermaid:
        (options = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              code: options.code || '',
            },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidNode);
  },
});

export default Mermaid;
