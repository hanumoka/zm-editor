import { Mark, mergeAttributes } from '@tiptap/core';

export interface GlossaryOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    glossary: {
      /**
       * Set a glossary mark with definition
       */
      setGlossary: (options: { term: string; definition: string }) => ReturnType;
      /**
       * Toggle a glossary mark
       */
      toggleGlossary: (options: { term: string; definition: string }) => ReturnType;
      /**
       * Unset a glossary mark
       */
      unsetGlossary: () => ReturnType;
      /**
       * Update glossary definition
       */
      updateGlossary: (options: { definition: string }) => ReturnType;
    };
  }
}

/**
 * Glossary Extension - 용어 정의 (팝오버)
 *
 * 텍스트에 용어 정의를 추가하여 호버 시 팝오버로 표시합니다.
 */
export const Glossary = Mark.create<GlossaryOptions>({
  name: 'glossary',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'zm-glossary',
      },
    };
  },

  addAttributes() {
    return {
      term: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-term') || element.textContent || '',
        renderHTML: (attributes) => {
          if (!attributes.term) return {};
          return { 'data-term': attributes.term };
        },
      },
      definition: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-definition') || '',
        renderHTML: (attributes) => {
          if (!attributes.definition) return {};
          return { 'data-definition': attributes.definition };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-glossary]',
      },
      {
        tag: 'span.zm-glossary',
      },
      {
        tag: 'abbr[title]',
        getAttrs: (element) => {
          const el = element as HTMLElement;
          return {
            term: el.textContent || '',
            definition: el.getAttribute('title') || '',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-glossary': '',
        'title': HTMLAttributes.definition || '',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setGlossary:
        (options) =>
        ({ commands }) => {
          return commands.setMark(this.name, options);
        },
      toggleGlossary:
        (options) =>
        ({ commands }) => {
          return commands.toggleMark(this.name, options);
        },
      unsetGlossary:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
      updateGlossary:
        (options) =>
        ({ chain }) => {
          return chain().extendMarkRange(this.name).updateAttributes(this.name, options).run();
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      // Mod+Shift+G로 glossary 토글
      'Mod-Shift-g': () => {
        // Prompt for definition - this will be handled in the React component
        return this.editor.commands.toggleGlossary({ term: '', definition: '' });
      },
    };
  },
});

export default Glossary;
