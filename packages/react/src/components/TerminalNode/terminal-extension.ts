'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TerminalNode } from './TerminalNode';

export interface TerminalOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    terminal: {
      /**
       * Insert a terminal block
       */
      setTerminal: (options?: { command?: string; output?: string }) => ReturnType;
    };
  }
}

/**
 * Terminal Extension - 터미널/CLI 블록
 *
 * 명령어와 출력을 표시하는 터미널 스타일 블록
 */
export const Terminal = Node.create<TerminalOptions>({
  name: 'terminal',

  group: 'block',

  atom: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'zm-terminal',
      },
    };
  },

  addAttributes() {
    return {
      command: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-command') || '',
        renderHTML: (attributes) => ({
          'data-command': attributes.command,
        }),
      },
      output: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-output') || '',
        renderHTML: (attributes) => ({
          'data-output': attributes.output,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-terminal]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-terminal': '',
      }),
    ];
  },

  addCommands() {
    return {
      setTerminal:
        (options = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              command: options.command || '',
              output: options.output || '',
            },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(TerminalNode);
  },
});

export default Terminal;
