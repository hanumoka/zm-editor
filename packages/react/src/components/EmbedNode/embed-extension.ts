import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { EmbedNode } from './EmbedNode';

export interface EmbedOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embed: {
      /**
       * Insert an embed block
       */
      setEmbed: (options: { src: string }) => ReturnType;
    };
  }
}

/**
 * Embed Extension - YouTube, Vimeo, Twitter 등 임베드 지원
 */
export const Embed = Node.create<EmbedOptions>({
  name: 'embed',

  group: 'block',

  atom: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'zm-embed',
      },
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-src'),
        renderHTML: (attributes) => ({
          'data-src': attributes.src,
        }),
      },
      embedType: {
        default: 'unknown',
        parseHTML: (element) => element.getAttribute('data-embed-type'),
        renderHTML: (attributes) => ({
          'data-embed-type': attributes.embedType,
        }),
      },
      embedUrl: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-embed-url'),
        renderHTML: (attributes) => ({
          'data-embed-url': attributes.embedUrl,
        }),
      },
      aspectRatio: {
        default: '16/9',
        parseHTML: (element) => element.getAttribute('data-aspect-ratio'),
        renderHTML: (attributes) => ({
          'data-aspect-ratio': attributes.aspectRatio,
        }),
      },
      caption: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-caption'),
        renderHTML: (attributes) => {
          if (!attributes.caption) {
            return {};
          }
          return {
            'data-caption': attributes.caption,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-embed]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-embed': '',
      }),
    ];
  },

  addCommands() {
    return {
      setEmbed:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedNode);
  },
});

export default Embed;
