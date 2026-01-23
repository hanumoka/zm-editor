import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { DiffBlockNode } from './DiffBlockNode';

export interface DiffBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    diffBlock: {
      setDiffBlock: () => ReturnType;
    };
  }
}

export const DiffBlock = Node.create<DiffBlockOptions>({
  name: 'diffBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'zm-diff-block',
      },
    };
  },

  addAttributes() {
    return {
      content: {
        default: '',
        parseHTML: element => element.getAttribute('data-content') || '',
        renderHTML: attributes => {
          if (!attributes.content) return {};
          return { 'data-content': attributes.content };
        },
      },
      filename: {
        default: '',
        parseHTML: element => element.getAttribute('data-filename') || '',
        renderHTML: attributes => {
          if (!attributes.filename) return {};
          return { 'data-filename': attributes.filename };
        },
      },
      language: {
        default: '',
        parseHTML: element => element.getAttribute('data-language') || '',
        renderHTML: attributes => {
          if (!attributes.language) return {};
          return { 'data-language': attributes.language };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="diff-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'diff-block' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DiffBlockNode);
  },

  addCommands() {
    return {
      setDiffBlock:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              content: '',
              filename: '',
              language: '',
            },
          });
        },
    };
  },
});

export default DiffBlock;
