import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { GraphQLNode } from './GraphQLNode';

export interface GraphQLOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    graphql: {
      /**
       * Insert a GraphQL query block
       */
      setGraphQL: (options?: {
        endpoint?: string;
        query?: string;
        variables?: string;
        response?: string;
      }) => ReturnType;
    };
  }
}

export const GraphQL = Node.create<GraphQLOptions>({
  name: 'graphql',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'zm-graphql',
      },
    };
  },

  addAttributes() {
    return {
      endpoint: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-endpoint') || '',
        renderHTML: (attributes) => {
          if (!attributes.endpoint) return {};
          return { 'data-endpoint': attributes.endpoint };
        },
      },
      query: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-query') || '',
        renderHTML: (attributes) => {
          if (!attributes.query) return {};
          return { 'data-query': attributes.query };
        },
      },
      variables: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-variables') || '',
        renderHTML: (attributes) => {
          if (!attributes.variables) return {};
          return { 'data-variables': attributes.variables };
        },
      },
      response: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-response') || '',
        renderHTML: (attributes) => {
          if (!attributes.response) return {};
          return { 'data-response': attributes.response };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-graphql-block]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-graphql-block': '' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(GraphQLNode);
  },

  addCommands() {
    return {
      setGraphQL:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              endpoint: options?.endpoint || '',
              query: options?.query || '',
              variables: options?.variables || '',
              response: options?.response || '',
            },
          });
        },
    };
  },
});

export default GraphQL;
