import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { MetadataNode } from './MetadataNode';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface MetadataOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    metadata: {
      /**
       * Insert a metadata block
       */
      setMetadata: (options?: {
        author?: string;
        difficulty?: DifficultyLevel;
        duration?: string;
        lastUpdated?: string;
        tags?: string;
        customFields?: string;
      }) => ReturnType;
    };
  }
}

export const Metadata = Node.create<MetadataOptions>({
  name: 'metadata',

  group: 'block',

  atom: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'zm-metadata',
      },
    };
  },

  addAttributes() {
    return {
      author: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-author') || '',
        renderHTML: (attributes) => {
          if (!attributes.author) return {};
          return { 'data-author': attributes.author };
        },
      },
      difficulty: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-difficulty') || '',
        renderHTML: (attributes) => {
          if (!attributes.difficulty) return {};
          return { 'data-difficulty': attributes.difficulty };
        },
      },
      duration: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-duration') || '',
        renderHTML: (attributes) => {
          if (!attributes.duration) return {};
          return { 'data-duration': attributes.duration };
        },
      },
      lastUpdated: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-last-updated') || '',
        renderHTML: (attributes) => {
          if (!attributes.lastUpdated) return {};
          return { 'data-last-updated': attributes.lastUpdated };
        },
      },
      tags: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-tags') || '',
        renderHTML: (attributes) => {
          if (!attributes.tags) return {};
          return { 'data-tags': attributes.tags };
        },
      },
      customFields: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-custom-fields') || '',
        renderHTML: (attributes) => {
          if (!attributes.customFields) return {};
          return { 'data-custom-fields': attributes.customFields };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-metadata-block]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-metadata-block': '' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MetadataNode);
  },

  addCommands() {
    return {
      setMetadata:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              author: options?.author || '',
              difficulty: options?.difficulty || '',
              duration: options?.duration || '',
              lastUpdated: options?.lastUpdated || '',
              tags: options?.tags || '',
              customFields: options?.customFields || '',
            },
          });
        },
    };
  },
});

export default Metadata;
