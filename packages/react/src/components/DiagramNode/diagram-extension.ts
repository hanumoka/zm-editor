import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { DiagramNode } from './DiagramNode';

export type DiagramType = 'plantuml' | 'd2';

export interface DiagramOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    diagram: {
      /**
       * Insert a diagram block (PlantUML or D2)
       */
      setDiagram: (options?: {
        type?: DiagramType;
        code?: string;
        theme?: string;
      }) => ReturnType;
    };
  }
}

export const Diagram = Node.create<DiagramOptions>({
  name: 'diagram',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'zm-diagram',
      },
    };
  },

  addAttributes() {
    return {
      type: {
        default: 'plantuml',
        parseHTML: (element) => element.getAttribute('data-diagram-type') || 'plantuml',
        renderHTML: (attributes) => {
          return { 'data-diagram-type': attributes.type };
        },
      },
      code: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-code') || '',
        renderHTML: (attributes) => {
          if (!attributes.code) return {};
          return { 'data-code': attributes.code };
        },
      },
      theme: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-theme') || '',
        renderHTML: (attributes) => {
          if (!attributes.theme) return {};
          return { 'data-theme': attributes.theme };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-diagram-block]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-diagram-block': '' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DiagramNode);
  },

  addCommands() {
    return {
      setDiagram:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              type: options?.type || 'plantuml',
              code: options?.code || '',
              theme: options?.theme || '',
            },
          });
        },
    };
  },
});

export default Diagram;
