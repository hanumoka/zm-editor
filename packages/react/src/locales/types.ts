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
    file: SlashCommandLocale;
    embed: SlashCommandLocale;
    callout: SlashCommandLocale;
    toggle: SlashCommandLocale;
    bookmark: SlashCommandLocale;
    math: SlashCommandLocale;
    toc: SlashCommandLocale;
    terminal: SlashCommandLocale;
    apiBlock: SlashCommandLocale;
    mermaid: SlashCommandLocale;
    errorMessage: SlashCommandLocale;
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
  keyboard: string;
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
  unsafeUrlError: string;
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
 * 북마크 노드 번역
 */
export interface BookmarkNodeLocale {
  placeholder: string;
  editUrl: string;
  openInNewTab: string;
  addCaption: string;
}

/**
 * 임베드 노드 번역
 */
export interface EmbedNodeLocale {
  placeholder: string;
  hint: string;
  editUrl: string;
  openInNewTab: string;
  addCaption: string;
  viewOnTwitter: string;
  unableToEmbed: string;
}

/**
 * 수학 수식 노드 번역
 */
export interface MathNodeLocale {
  label: string;
  placeholder: string;
  hint: string;
  edit: string;
}

/**
 * 파일 첨부 노드 번역
 */
export interface FileAttachmentNodeLocale {
  download: string;
  addCaption: string;
  uploadingFile: string;
}

/**
 * 이미지 노드 번역
 */
export interface ImageNodeLocale {
  invalidUrl: string;
}

/**
 * 터미널 노드 번역
 */
export interface TerminalNodeLocale {
  title: string;
  commandPlaceholder: string;
  output: string;
  outputPlaceholder: string;
  copyCommand: string;
  copyOutput: string;
  copied: string;
  clickToEdit: string;
}

/**
 * API 블록 노드 번역
 */
export interface ApiBlockNodeLocale {
  urlPlaceholder: string;
  requestBody: string;
  responseBody: string;
  requestPlaceholder: string;
  responsePlaceholder: string;
  copy: string;
  copied: string;
}

/**
 * Mermaid 다이어그램 노드 번역
 */
export interface MermaidNodeLocale {
  label: string;
  placeholder: string;
  hint: string;
  edit: string;
}

/**
 * 에러 메시지 노드 번역
 */
export interface ErrorMessageNodeLocale {
  titlePlaceholder: string;
  messagePlaceholder: string;
  hint: string;
  edit: string;
}

/**
 * NodeView 컴포넌트 번역
 */
export interface NodesLocale {
  bookmark: BookmarkNodeLocale;
  embed: EmbedNodeLocale;
  math: MathNodeLocale;
  fileAttachment: FileAttachmentNodeLocale;
  image: ImageNodeLocale;
  terminal: TerminalNodeLocale;
  apiBlock: ApiBlockNodeLocale;
  mermaid: MermaidNodeLocale;
  errorMessage: ErrorMessageNodeLocale;
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
  nodes: NodesLocale;
}
