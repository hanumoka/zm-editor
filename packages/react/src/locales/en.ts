import type { ZmEditorLocale } from './types';

/**
 * 영어 로케일 (기본값)
 */
export const enLocale: ZmEditorLocale = {
  editor: {
    placeholder: "Type '/' for commands...",
    loading: 'Loading editor...',
  },
  slashMenu: {
    noResults: 'No results found',
    commands: {
      text: {
        title: 'Text',
        description: 'Plain text paragraph',
      },
      heading1: {
        title: 'Heading 1',
        description: 'Large section heading',
      },
      heading2: {
        title: 'Heading 2',
        description: 'Medium section heading',
      },
      heading3: {
        title: 'Heading 3',
        description: 'Small section heading',
      },
      bulletList: {
        title: 'Bullet List',
        description: 'Unordered list with bullets',
      },
      numberedList: {
        title: 'Numbered List',
        description: 'Ordered list with numbers',
      },
      taskList: {
        title: 'Task List',
        description: 'Checklist with checkboxes',
      },
      quote: {
        title: 'Quote',
        description: 'Blockquote for citations',
      },
      codeBlock: {
        title: 'Code Block',
        description: 'Code with syntax highlighting',
      },
      divider: {
        title: 'Divider',
        description: 'Horizontal divider line',
      },
    },
  },
  bubbleMenu: {
    bold: 'Bold',
    italic: 'Italic',
    underline: 'Underline',
    strikethrough: 'Strikethrough',
    code: 'Code',
    highlight: 'Highlight',
    link: 'Link',
  },
  dialogs: {
    linkUrlPrompt: 'URL',
  },
};
