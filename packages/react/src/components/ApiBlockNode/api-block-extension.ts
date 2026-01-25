'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ApiBlockNode } from './ApiBlockNode';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    apiBlock: {
      /**
       * Insert an API block
       */
      setApiBlock: (options?: {
        method?: HttpMethod;
        url?: string;
        requestBody?: string;
        responseBody?: string;
        statusCode?: number;
      }) => ReturnType;
    };
  }
}

/**
 * ApiBlock Extension - API Request/Response 블록
 *
 * HTTP 요청/응답을 문서화하는 블록
 */
export const ApiBlock = Node.create<ApiBlockOptions>({
  name: 'apiBlock',

  group: 'block',

  atom: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'zm-api-block',
      },
    };
  },

  addAttributes() {
    return {
      method: {
        default: 'GET',
        parseHTML: (element) => element.getAttribute('data-method') || 'GET',
        renderHTML: (attributes) => ({
          'data-method': attributes.method,
        }),
      },
      url: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-url') || '',
        renderHTML: (attributes) => ({
          'data-url': attributes.url,
        }),
      },
      requestBody: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-request-body') || '',
        renderHTML: (attributes) => ({
          'data-request-body': attributes.requestBody,
        }),
      },
      responseBody: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-response-body') || '',
        renderHTML: (attributes) => ({
          'data-response-body': attributes.responseBody,
        }),
      },
      statusCode: {
        default: 200,
        parseHTML: (element) => {
          const code = element.getAttribute('data-status-code');
          return code ? parseInt(code, 10) : 200;
        },
        renderHTML: (attributes) => ({
          'data-status-code': attributes.statusCode,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-api-block]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-api-block': '',
      }),
    ];
  },

  addCommands() {
    return {
      setApiBlock:
        (options = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              method: options.method || 'GET',
              url: options.url || '',
              requestBody: options.requestBody || '',
              responseBody: options.responseBody || '',
              statusCode: options.statusCode || 200,
            },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ApiBlockNode);
  },
});

export default ApiBlock;
