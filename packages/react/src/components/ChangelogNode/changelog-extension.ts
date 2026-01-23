import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ChangelogNode } from './ChangelogNode';

export interface ChangelogOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    changelog: {
      /**
       * Insert a changelog block
       */
      setChangelog: (options?: { version?: string; date?: string; changes?: string }) => ReturnType;
    };
  }
}

export const Changelog = Node.create<ChangelogOptions>({
  name: 'changelog',

  group: 'block',

  atom: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      version: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-version') || '',
        renderHTML: (attributes) => ({
          'data-version': attributes.version,
        }),
      },
      date: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-date') || '',
        renderHTML: (attributes) => ({
          'data-date': attributes.date,
        }),
      },
      changes: {
        default: '[]',
        parseHTML: (element) => element.getAttribute('data-changes') || '[]',
        renderHTML: (attributes) => ({
          'data-changes': attributes.changes,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="changelog"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'changelog',
      }),
    ];
  },

  addCommands() {
    return {
      setChangelog:
        (options = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              version: options.version || '',
              date: options.date || '',
              changes: options.changes || '[]',
            },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ChangelogNode);
  },
});

export default Changelog;
