import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { FootnoteNode, FootnoteItem } from './FootnoteNode';

export interface FootnoteOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    footnoteBlock: {
      setFootnoteBlock: () => ReturnType;
    };
  }
}

export const FootnoteBlock = Node.create<FootnoteOptions>({
  name: 'footnoteBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'zm-footnote',
      },
    };
  },

  addAttributes() {
    return {
      footnotes: {
        default: [] as FootnoteItem[],
        parseHTML: element => {
          const data = element.getAttribute('data-footnotes');
          if (!data) return [];
          try {
            return JSON.parse(data);
          } catch {
            return [];
          }
        },
        renderHTML: attributes => {
          if (!attributes.footnotes || attributes.footnotes.length === 0) return {};
          return { 'data-footnotes': JSON.stringify(attributes.footnotes) };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="footnote-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'footnote-block' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FootnoteNode);
  },

  addCommands() {
    return {
      setFootnoteBlock:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              footnotes: [{ id: '1', content: '' }],
            },
          });
        },
    };
  },
});

export default FootnoteBlock;
