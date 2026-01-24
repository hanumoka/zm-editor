import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { LogBlockNode } from './LogBlockNode';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    logBlock: {
      /**
       * Insert a log block
       */
      setLogBlock: (options?: { level?: LogLevel; message?: string; timestamp?: string; source?: string }) => ReturnType;
    };
  }
}

export const LogBlock = Node.create<LogBlockOptions>({
  name: 'logBlock',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'zm-log-block',
      },
    };
  },

  addAttributes() {
    return {
      level: {
        default: 'info',
        parseHTML: (element) => element.getAttribute('data-level') || 'info',
        renderHTML: (attributes) => {
          return { 'data-level': attributes.level };
        },
      },
      message: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-message') || '',
        renderHTML: (attributes) => {
          return { 'data-message': attributes.message };
        },
      },
      timestamp: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-timestamp') || '',
        renderHTML: (attributes) => {
          if (!attributes.timestamp) return {};
          return { 'data-timestamp': attributes.timestamp };
        },
      },
      source: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-source') || '',
        renderHTML: (attributes) => {
          if (!attributes.source) return {};
          return { 'data-source': attributes.source };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-log-block]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-log-block': '' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LogBlockNode);
  },

  addCommands() {
    return {
      setLogBlock:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              level: options?.level || 'info',
              message: options?.message || '',
              timestamp: options?.timestamp || '',
              source: options?.source || '',
            },
          });
        },
    };
  },
});

export default LogBlock;
