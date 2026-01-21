import { Extension, Range, Editor } from '@tiptap/core';
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';

/**
 * 슬래시 명령어 아이템 인터페이스
 */
export interface SlashCommandItem {
  title: string;
  description: string;
  icon?: string;
  searchTerms?: string[];
  command: (props: { editor: Editor; range: Range }) => void;
}

/**
 * 슬래시 명령어 확장 옵션
 */
export interface SlashCommandOptions {
  suggestion: Omit<SuggestionOptions<SlashCommandItem>, 'editor'>;
}

/**
 * 슬래시 명령어 확장
 *
 * '/' 입력 시 명령어 메뉴를 표시합니다.
 */
export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

/**
 * 기본 슬래시 명령어 아이템들
 */
export const defaultSlashCommands: SlashCommandItem[] = [
  {
    title: 'Text',
    description: 'Plain text paragraph',
    searchTerms: ['paragraph', 'text', 'p'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run();
    },
  },
  {
    title: 'Heading 1',
    description: 'Large section heading',
    searchTerms: ['h1', 'heading', 'title', 'large'],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHeading({ level: 1 })
        .run();
    },
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    searchTerms: ['h2', 'heading', 'subtitle', 'medium'],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHeading({ level: 2 })
        .run();
    },
  },
  {
    title: 'Heading 3',
    description: 'Small section heading',
    searchTerms: ['h3', 'heading', 'small'],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHeading({ level: 3 })
        .run();
    },
  },
  {
    title: 'Bullet List',
    description: 'Unordered list with bullets',
    searchTerms: ['unordered', 'bullet', 'list', 'ul'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: 'Numbered List',
    description: 'Ordered list with numbers',
    searchTerms: ['ordered', 'number', 'list', 'ol'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: 'Task List',
    description: 'Checklist with checkboxes',
    searchTerms: ['todo', 'task', 'checkbox', 'check'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: 'Quote',
    description: 'Blockquote for citations',
    searchTerms: ['quote', 'blockquote', 'citation'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: 'Code Block',
    description: 'Code with syntax highlighting',
    searchTerms: ['code', 'codeblock', 'pre', 'programming'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: 'Divider',
    description: 'Horizontal divider line',
    searchTerms: ['hr', 'divider', 'horizontal', 'rule', 'line'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
];

export { Suggestion };
