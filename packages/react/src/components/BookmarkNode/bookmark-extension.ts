import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { BookmarkNode } from './BookmarkNode';

export interface BookmarkOptions {
  HTMLAttributes: Record<string, unknown>;
}

export interface BookmarkMetadata {
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  siteName?: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    bookmark: {
      /**
       * Insert a bookmark block
       */
      setBookmark: (options?: { url?: string }) => ReturnType;
    };
  }
}

/**
 * Bookmark Extension - 링크 미리보기 카드
 */
export const Bookmark = Node.create<BookmarkOptions>({
  name: 'bookmark',

  group: 'block',

  atom: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'zm-bookmark',
      },
    };
  },

  addAttributes() {
    return {
      url: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-url') || '',
        renderHTML: (attributes) => ({
          'data-url': attributes.url,
        }),
      },
      title: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-title') || '',
        renderHTML: (attributes) => ({
          'data-title': attributes.title,
        }),
      },
      description: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-description') || '',
        renderHTML: (attributes) => ({
          'data-description': attributes.description,
        }),
      },
      image: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-image') || '',
        renderHTML: (attributes) => {
          if (!attributes.image) return {};
          return { 'data-image': attributes.image };
        },
      },
      favicon: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-favicon') || '',
        renderHTML: (attributes) => {
          if (!attributes.favicon) return {};
          return { 'data-favicon': attributes.favicon };
        },
      },
      siteName: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-site-name') || '',
        renderHTML: (attributes) => {
          if (!attributes.siteName) return {};
          return { 'data-site-name': attributes.siteName };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-bookmark]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-bookmark': '',
      }),
    ];
  },

  addCommands() {
    return {
      setBookmark:
        (options = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              url: options.url || '',
            },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(BookmarkNode);
  },
});

export default Bookmark;
