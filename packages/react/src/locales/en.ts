import type { ZmEditorLocale } from './types';

/**
 * 영어 로케일 (기본값)
 */
export const enLocale: ZmEditorLocale = {
  editor: {
    placeholder: "Type '/' for commands...",
    loading: 'Loading editor...',
    uploading: 'Uploading image...',
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
      table: {
        title: 'Table',
        description: 'Insert a table',
      },
      image: {
        title: 'Image',
        description: 'Upload or embed an image',
      },
      embed: {
        title: 'Embed',
        description: 'YouTube, Vimeo, Twitter, CodePen',
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
  tableBubbleMenu: {
    addColumnBefore: 'Add column before',
    addColumnAfter: 'Add column after',
    deleteColumn: 'Delete column',
    addRowBefore: 'Add row before',
    addRowAfter: 'Add row after',
    deleteRow: 'Delete row',
    deleteTable: 'Delete table',
    mergeCells: 'Merge cells',
    splitCell: 'Split cell',
    toggleHeaderColumn: 'Toggle header column',
    toggleHeaderRow: 'Toggle header row',
    toggleHeaderCell: 'Toggle header cell',
  },
  dialogs: {
    linkUrlPrompt: 'URL',
  },
};
