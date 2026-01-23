import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ErrorMessageNode } from './ErrorMessageNode';

export interface ErrorMessageOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    errorMessage: {
      /**
       * Insert an error message block
       */
      setErrorMessage: (options?: { title?: string; message?: string; type?: string }) => ReturnType;
    };
  }
}

export const ErrorMessage = Node.create<ErrorMessageOptions>({
  name: 'errorMessage',

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
      title: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-title') || '',
        renderHTML: (attributes) => ({
          'data-title': attributes.title,
        }),
      },
      message: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-message') || '',
        renderHTML: (attributes) => ({
          'data-message': attributes.message,
        }),
      },
      type: {
        default: 'error',
        parseHTML: (element) => element.getAttribute('data-message-type') || 'error',
        renderHTML: (attributes) => ({
          'data-message-type': attributes.type,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="error-message"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'error-message',
      }),
    ];
  },

  addCommands() {
    return {
      setErrorMessage:
        (options = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              title: options.title || '',
              message: options.message || '',
              type: options.type || 'error',
            },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ErrorMessageNode);
  },
});

export default ErrorMessage;
