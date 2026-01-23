import { Mark, mergeAttributes } from '@tiptap/core';

export interface KeyboardOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    keyboard: {
      /**
       * Set a keyboard mark
       */
      setKeyboard: () => ReturnType;
      /**
       * Toggle a keyboard mark
       */
      toggleKeyboard: () => ReturnType;
      /**
       * Unset a keyboard mark
       */
      unsetKeyboard: () => ReturnType;
    };
  }
}

/**
 * Keyboard Extension - 키보드 단축키 표시
 *
 * `<kbd>` 태그로 키보드 단축키를 표시합니다.
 * 예: Ctrl+C, ⌘+V, Enter
 */
export const Keyboard = Mark.create<KeyboardOptions>({
  name: 'keyboard',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'zm-kbd',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'kbd',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['kbd', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setKeyboard:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name);
        },
      toggleKeyboard:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
      unsetKeyboard:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      // Ctrl+Shift+K 또는 Cmd+Shift+K로 kbd 토글
      'Mod-Shift-k': () => this.editor.commands.toggleKeyboard(),
    };
  },
});

export default Keyboard;
