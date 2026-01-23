import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { GistNode } from './GistNode';

export interface GistOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    gist: {
      setGist: (attrs?: { gistId?: string; gistFile?: string }) => ReturnType;
    };
  }
}

export const Gist = Node.create<GistOptions>({
  name: 'gist',
  group: 'block',
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'zm-gist',
      },
    };
  },

  addAttributes() {
    return {
      gistId: {
        default: '',
        parseHTML: element => element.getAttribute('data-gist-id') || '',
        renderHTML: attributes => {
          if (!attributes.gistId) return {};
          return { 'data-gist-id': attributes.gistId };
        },
      },
      gistFile: {
        default: '',
        parseHTML: element => element.getAttribute('data-gist-file') || '',
        renderHTML: attributes => {
          if (!attributes.gistFile) return {};
          return { 'data-gist-file': attributes.gistFile };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="gist"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'gist' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(GistNode);
  },

  addCommands() {
    return {
      setGist:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attrs || {},
          });
        },
    };
  },
});

export default Gist;
