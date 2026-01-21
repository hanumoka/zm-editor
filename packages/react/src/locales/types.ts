/**
 * zm-editor 다국어 지원 타입 정의
 */

/**
 * 슬래시 명령어 번역
 */
export interface SlashCommandLocale {
  title: string;
  description: string;
}

/**
 * 슬래시 메뉴 번역
 */
export interface SlashMenuLocale {
  noResults: string;
  commands: {
    text: SlashCommandLocale;
    heading1: SlashCommandLocale;
    heading2: SlashCommandLocale;
    heading3: SlashCommandLocale;
    bulletList: SlashCommandLocale;
    numberedList: SlashCommandLocale;
    taskList: SlashCommandLocale;
    quote: SlashCommandLocale;
    codeBlock: SlashCommandLocale;
    divider: SlashCommandLocale;
    table: SlashCommandLocale;
    image: SlashCommandLocale;
    embed: SlashCommandLocale;
  };
}

/**
 * 버블 메뉴 번역
 */
export interface BubbleMenuLocale {
  bold: string;
  italic: string;
  underline: string;
  strikethrough: string;
  code: string;
  highlight: string;
  link: string;
}

/**
 * 에디터 번역
 */
export interface EditorLocale {
  placeholder: string;
  loading: string;
  uploading: string;
}

/**
 * 다이얼로그 번역
 */
export interface DialogLocale {
  linkUrlPrompt: string;
}

/**
 * 테이블 버블 메뉴 번역
 */
export interface TableBubbleMenuLocale {
  addColumnBefore: string;
  addColumnAfter: string;
  deleteColumn: string;
  addRowBefore: string;
  addRowAfter: string;
  deleteRow: string;
  deleteTable: string;
  mergeCells: string;
  splitCell: string;
  toggleHeaderColumn: string;
  toggleHeaderRow: string;
  toggleHeaderCell: string;
}

/**
 * zm-editor 전체 로케일 인터페이스
 */
export interface ZmEditorLocale {
  editor: EditorLocale;
  slashMenu: SlashMenuLocale;
  bubbleMenu: BubbleMenuLocale;
  tableBubbleMenu: TableBubbleMenuLocale;
  dialogs: DialogLocale;
}
