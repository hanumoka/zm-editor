import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { EnvBlockNode, EnvVariable } from './EnvBlockNode';

export interface EnvBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    envBlock: {
      setEnvBlock: () => ReturnType;
    };
  }
}

export const EnvBlock = Node.create<EnvBlockOptions>({
  name: 'envBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'zm-env-block',
      },
    };
  },

  addAttributes() {
    return {
      title: {
        default: '',
        parseHTML: element => element.getAttribute('data-title') || '',
        renderHTML: attributes => {
          if (!attributes.title) return {};
          return { 'data-title': attributes.title };
        },
      },
      variables: {
        default: [] as EnvVariable[],
        parseHTML: element => {
          const data = element.getAttribute('data-variables');
          if (!data) return [];
          try {
            return JSON.parse(data);
          } catch {
            return [];
          }
        },
        renderHTML: attributes => {
          if (!attributes.variables || attributes.variables.length === 0) return {};
          return { 'data-variables': JSON.stringify(attributes.variables) };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="env-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'env-block' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EnvBlockNode);
  },

  addCommands() {
    return {
      setEnvBlock:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              title: '',
              variables: [{ key: '', value: '', masked: true }],
            },
          });
        },
    };
  },
});

export default EnvBlock;
