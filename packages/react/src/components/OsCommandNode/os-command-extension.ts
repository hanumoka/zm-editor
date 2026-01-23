'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { OsCommandNode } from './OsCommandNode';

export interface OsCommandOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    osCommand: {
      /**
       * Insert an OS command block
       */
      setOsCommand: (options?: {
        macosCommand?: string;
        linuxCommand?: string;
        windowsCommand?: string;
      }) => ReturnType;
    };
  }
}

/**
 * OsCommand Extension - OS별 명령어 탭 블록
 *
 * macOS, Linux, Windows 세 가지 OS에 대한 명령어를 탭으로 표시
 */
export const OsCommand = Node.create<OsCommandOptions>({
  name: 'osCommand',

  group: 'block',

  atom: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'zm-os-command',
      },
    };
  },

  addAttributes() {
    return {
      macosCommand: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-macos-command') || '',
        renderHTML: (attributes) => ({
          'data-macos-command': attributes.macosCommand,
        }),
      },
      linuxCommand: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-linux-command') || '',
        renderHTML: (attributes) => ({
          'data-linux-command': attributes.linuxCommand,
        }),
      },
      windowsCommand: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-windows-command') || '',
        renderHTML: (attributes) => ({
          'data-windows-command': attributes.windowsCommand,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-os-command]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-os-command': '',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setOsCommand:
        (options = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              macosCommand: options.macosCommand || '',
              linuxCommand: options.linuxCommand || '',
              windowsCommand: options.windowsCommand || '',
            },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(OsCommandNode);
  },
});

export default OsCommand;
