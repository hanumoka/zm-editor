import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { StackTraceNode } from './StackTraceNode';

export type StackTraceLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'go' | 'rust' | 'csharp' | 'ruby' | 'php' | 'other';

export interface StackTraceOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    stackTrace: {
      /**
       * Insert a stack trace block
       */
      setStackTrace: (options?: {
        language?: StackTraceLanguage;
        errorType?: string;
        errorMessage?: string;
        stackTrace?: string;
      }) => ReturnType;
    };
  }
}

export const StackTrace = Node.create<StackTraceOptions>({
  name: 'stackTrace',

  group: 'block',

  atom: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'zm-stack-trace',
      },
    };
  },

  addAttributes() {
    return {
      language: {
        default: 'javascript',
        parseHTML: (element) => element.getAttribute('data-language') || 'javascript',
        renderHTML: (attributes) => {
          return { 'data-language': attributes.language };
        },
      },
      errorType: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-error-type') || '',
        renderHTML: (attributes) => {
          if (!attributes.errorType) return {};
          return { 'data-error-type': attributes.errorType };
        },
      },
      errorMessage: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-error-message') || '',
        renderHTML: (attributes) => {
          if (!attributes.errorMessage) return {};
          return { 'data-error-message': attributes.errorMessage };
        },
      },
      stackTrace: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-stack-trace') || '',
        renderHTML: (attributes) => {
          if (!attributes.stackTrace) return {};
          return { 'data-stack-trace': attributes.stackTrace };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-stack-trace]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-stack-trace-block': '' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(StackTraceNode);
  },

  addCommands() {
    return {
      setStackTrace:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              language: options?.language || 'javascript',
              errorType: options?.errorType || '',
              errorMessage: options?.errorMessage || '',
              stackTrace: options?.stackTrace || '',
            },
          });
        },
    };
  },
});

export default StackTrace;
