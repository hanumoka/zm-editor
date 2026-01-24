import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { OpenAPINode } from './OpenAPINode';

export type DisplayMode = 'swagger-ui' | 'redoc' | 'minimal';

export interface OpenAPIOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    openapi: {
      /**
       * Insert an OpenAPI/Swagger block
       */
      setOpenAPI: (options?: {
        specUrl?: string;
        displayMode?: DisplayMode;
      }) => ReturnType;
    };
  }
}

export const OpenAPI = Node.create<OpenAPIOptions>({
  name: 'openapi',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'zm-openapi',
      },
    };
  },

  addAttributes() {
    return {
      specUrl: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-spec-url') || '',
        renderHTML: (attributes) => {
          if (!attributes.specUrl) return {};
          return { 'data-spec-url': attributes.specUrl };
        },
      },
      displayMode: {
        default: 'swagger-ui',
        parseHTML: (element) => element.getAttribute('data-display-mode') || 'swagger-ui',
        renderHTML: (attributes) => {
          return { 'data-display-mode': attributes.displayMode };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-openapi-block]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-openapi-block': '' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(OpenAPINode);
  },

  addCommands() {
    return {
      setOpenAPI:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              specUrl: options?.specUrl || '',
              displayMode: options?.displayMode || 'swagger-ui',
            },
          });
        },
    };
  },
});

export default OpenAPI;
