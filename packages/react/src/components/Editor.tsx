'use client';

import { forwardRef, useImperativeHandle, useMemo, useCallback } from 'react';
import { useEditor, EditorContent, Editor as TiptapEditor, ReactNodeViewRenderer } from '@tiptap/react';
import type { JSONContent, Extension } from '@tiptap/core';
import {
  createStarterExtensions,
  SlashCommand,
  CodeBlockLowlight,
  lowlight,
  type SlashCommandItem,
  type ZmStarterKitOptions,
} from '@zm-editor/core';
import { BubbleMenu } from './BubbleMenu';
import { CodeBlock } from './CodeBlock';
import type { ZmEditorLocale } from '../locales';
import { enLocale } from '../locales';

export interface ZmEditorProps {
  /** 초기 콘텐츠 (JSON) */
  initialContent?: JSONContent;
  /** 콘텐츠 변경 콜백 */
  onChange?: (content: JSONContent) => void;
  /** HTML 변경 콜백 */
  onHtmlChange?: (html: string) => void;
  /** 읽기 전용 모드 */
  readOnly?: boolean;
  /** 에디터 클래스명 */
  className?: string;
  /** 플레이스홀더 텍스트 (locale 사용 시 무시됨) */
  placeholder?: string;
  /** 글자 수 제한 */
  characterLimit?: number;
  /** 슬래시 명령어 활성화 */
  enableSlashCommand?: boolean;
  /** 버블 메뉴 활성화 */
  enableBubbleMenu?: boolean;
  /** 커스텀 슬래시 명령어 (locale 기반 명령어 대신 사용) */
  slashCommands?: SlashCommandItem[];
  /** 자동 포커스 */
  autoFocus?: boolean;
  /** 추가 확장 기능 */
  extensions?: Extension[];
  /** 트랜잭션마다 리렌더링 여부 (성능 최적화) */
  shouldRerenderOnTransaction?: boolean;
  /** 다국어 로케일 (기본값: enLocale) */
  locale?: ZmEditorLocale;
}

export interface ZmEditorRef {
  /** Tiptap 에디터 인스턴스 */
  editor: TiptapEditor | null;
  /** JSON 콘텐츠 가져오기 */
  getJSON: () => JSONContent | undefined;
  /** HTML 콘텐츠 가져오기 */
  getHTML: () => string | undefined;
  /** 텍스트 콘텐츠 가져오기 */
  getText: () => string | undefined;
  /** 콘텐츠 설정 */
  setContent: (content: JSONContent | string) => void;
  /** 에디터 포커스 */
  focus: () => void;
  /** 에디터 초기화 */
  clear: () => void;
}

/**
 * 로케일 기반 슬래시 명령어 생성
 */
function createLocalizedSlashCommands(locale: ZmEditorLocale): SlashCommandItem[] {
  const { commands } = locale.slashMenu;

  return [
    {
      title: commands.text.title,
      description: commands.text.description,
      searchTerms: ['paragraph', 'text', 'p'],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setParagraph().run();
      },
    },
    {
      title: commands.heading1.title,
      description: commands.heading1.description,
      searchTerms: ['h1', 'heading', 'title', 'large'],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
      },
    },
    {
      title: commands.heading2.title,
      description: commands.heading2.description,
      searchTerms: ['h2', 'heading', 'subtitle', 'medium'],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
      },
    },
    {
      title: commands.heading3.title,
      description: commands.heading3.description,
      searchTerms: ['h3', 'heading', 'small'],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
      },
    },
    {
      title: commands.bulletList.title,
      description: commands.bulletList.description,
      searchTerms: ['unordered', 'bullet', 'list', 'ul'],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: commands.numberedList.title,
      description: commands.numberedList.description,
      searchTerms: ['ordered', 'number', 'list', 'ol'],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: commands.taskList.title,
      description: commands.taskList.description,
      searchTerms: ['todo', 'task', 'checkbox', 'check'],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
    },
    {
      title: commands.quote.title,
      description: commands.quote.description,
      searchTerms: ['quote', 'blockquote', 'citation'],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
    },
    {
      title: commands.codeBlock.title,
      description: commands.codeBlock.description,
      searchTerms: ['code', 'codeblock', 'pre', 'programming'],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
    },
    {
      title: commands.divider.title,
      description: commands.divider.description,
      searchTerms: ['hr', 'divider', 'horizontal', 'rule', 'line'],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
  ];
}

/**
 * ZmEditor - Notion-like Rich Text Editor
 *
 * React/Next.js용 Notion 스타일 에디터 컴포넌트
 */
export const ZmEditor = forwardRef<ZmEditorRef, ZmEditorProps>(
  (
    {
      initialContent,
      onChange,
      onHtmlChange,
      readOnly = false,
      className = '',
      placeholder,
      characterLimit = 50000,
      enableSlashCommand = true,
      enableBubbleMenu = true,
      slashCommands,
      autoFocus = false,
      extensions: customExtensions = [],
      shouldRerenderOnTransaction = false,
      locale = enLocale,
    },
    ref
  ) => {
    // 로케일 기반 슬래시 명령어 (커스텀 명령어가 없을 경우)
    const localizedSlashCommands = useMemo(
      () => slashCommands ?? createLocalizedSlashCommands(locale),
      [slashCommands, locale]
    );

    // 플레이스홀더 (props 우선, 없으면 locale 사용)
    const editorPlaceholder = placeholder ?? locale.editor.placeholder;

    // 확장 기능 구성 (메모이제이션으로 불필요한 재생성 방지)
    const extensions = useMemo(() => {
      const baseExtensions = createStarterExtensions({
        placeholder: editorPlaceholder,
        characterLimit,
        excludeCodeBlock: true, // React NodeView 사용을 위해 제외
      } as ZmStarterKitOptions);

      // 커스텀 CodeBlock (언어 선택 UI 포함)
      const codeBlockExtension = CodeBlockLowlight
        .extend({
          addNodeView() {
            return ReactNodeViewRenderer(CodeBlock);
          },
        })
        .configure({
          lowlight,
          HTMLAttributes: {
            class: 'zm-code-block',
          },
        });

      // 슬래시 명령어 확장 설정
      const slashCommandExtension = enableSlashCommand
        ? SlashCommand.configure({
            suggestion: {
              items: ({ query }: { query: string }) => {
                return localizedSlashCommands.filter((item) => {
                  const searchText = query.toLowerCase();
                  return (
                    item.title.toLowerCase().includes(searchText) ||
                    item.description.toLowerCase().includes(searchText) ||
                    item.searchTerms?.some((term) =>
                      term.toLowerCase().includes(searchText)
                    )
                  );
                });
              },
              render: () => {
                let component: SlashMenuComponent | null = null;
                const noResultsText = locale.slashMenu.noResults;

                return {
                  onStart: (props: SlashMenuRenderProps) => {
                    component = new SlashMenuComponent({ ...props, noResultsText });
                  },
                  onUpdate: (props: SlashMenuRenderProps) => {
                    component?.updateProps({ ...props, noResultsText });
                  },
                  onKeyDown: (props: { event: KeyboardEvent }) => {
                    if (props.event.key === 'Escape') {
                      component?.destroy();
                      return true;
                    }
                    return component?.onKeyDown(props.event) ?? false;
                  },
                  onExit: () => {
                    component?.destroy();
                  },
                };
              },
            },
          })
        : null;

      return [
        ...baseExtensions,
        codeBlockExtension,
        ...(slashCommandExtension ? [slashCommandExtension] : []),
        ...customExtensions,
      ];
    }, [editorPlaceholder, characterLimit, enableSlashCommand, localizedSlashCommands, customExtensions, locale]);

    // onChange 콜백 메모이제이션
    const handleUpdate = useCallback(
      ({ editor: e }: { editor: TiptapEditor }) => {
        onChange?.(e.getJSON());
        onHtmlChange?.(e.getHTML());
      },
      [onChange, onHtmlChange]
    );

    // 에디터 인스턴스 생성
    const editor = useEditor({
      extensions,
      content: initialContent,
      editable: !readOnly,
      autofocus: autoFocus,
      editorProps: {
        attributes: {
          class: `zm-editor-content ${className}`,
        },
      },
      onUpdate: handleUpdate,
      immediatelyRender: false,
      // 성능 최적화: 트랜잭션마다 리렌더링 방지
      shouldRerenderOnTransaction,
    });

    // ref를 통한 에디터 제어
    useImperativeHandle(ref, () => ({
      editor,
      getJSON: () => editor?.getJSON(),
      getHTML: () => editor?.getHTML(),
      getText: () => editor?.getText(),
      setContent: (content) => editor?.commands.setContent(content),
      focus: () => editor?.commands.focus(),
      clear: () => editor?.commands.clearContent(),
    }));

    if (!editor) {
      return (
        <div className="zm-editor">
          <div className="zm-editor-content" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
            {locale.editor.loading}
          </div>
        </div>
      );
    }

    return (
      <div className="zm-editor">
        {enableBubbleMenu && (
          <BubbleMenu
            editor={editor}
            locale={locale.bubbleMenu}
            dialogLocale={locale.dialogs}
          />
        )}
        <EditorContent editor={editor} />
      </div>
    );
  }
);

ZmEditor.displayName = 'ZmEditor';

// SlashMenu 컴포넌트를 위한 타입 및 클래스
interface SlashMenuRenderProps {
  editor: TiptapEditor;
  range: { from: number; to: number };
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
  clientRect?: (() => DOMRect | null) | null;
  noResultsText?: string;
}

class SlashMenuComponent {
  private props: SlashMenuRenderProps;
  private element: HTMLElement | null = null;
  private selectedIndex = 0;
  private clickHandlers: Array<{ element: Element; handler: () => void }> = [];

  constructor(props: SlashMenuRenderProps) {
    this.props = props;
    this.render();
  }

  updateProps(props: SlashMenuRenderProps) {
    this.props = props;
    // items가 변경되면 선택 인덱스 초기화
    if (this.selectedIndex >= props.items.length) {
      this.selectedIndex = 0;
    }
    this.render();
  }

  onKeyDown(event: KeyboardEvent): boolean {
    if (event.key === 'ArrowDown') {
      this.selectedIndex = Math.min(
        this.selectedIndex + 1,
        this.props.items.length - 1
      );
      this.render();
      return true;
    }

    if (event.key === 'ArrowUp') {
      this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
      this.render();
      return true;
    }

    if (event.key === 'Enter') {
      const item = this.props.items[this.selectedIndex];
      if (item) {
        this.props.command(item);
      }
      return true;
    }

    return false;
  }

  private removeEventListeners() {
    // 기존 이벤트 리스너 제거 (메모리 누수 방지)
    this.clickHandlers.forEach(({ element, handler }) => {
      element.removeEventListener('click', handler);
    });
    this.clickHandlers = [];
  }

  private render() {
    if (!this.element) {
      this.element = document.createElement('div');
      this.element.className = 'zm-slash-menu';
      document.body.appendChild(this.element);
    }

    const rect = this.props.clientRect?.();
    if (rect) {
      this.element.style.position = 'fixed';
      this.element.style.left = `${rect.left}px`;
      this.element.style.top = `${rect.bottom + 8}px`;
    }

    // 기존 이벤트 리스너 제거
    this.removeEventListeners();

    // DOM 생성 (textContent 사용으로 XSS 방지)
    this.element.innerHTML = '';

    if (this.props.items.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'zm-slash-menu-empty';
      emptyDiv.textContent = this.props.noResultsText ?? 'No results found';
      this.element.appendChild(emptyDiv);
      return;
    }

    this.props.items.forEach((item, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = `zm-slash-menu-item ${index === this.selectedIndex ? 'selected' : ''}`;
      itemDiv.dataset.index = String(index);

      const titleDiv = document.createElement('div');
      titleDiv.className = 'zm-slash-menu-item-title';
      titleDiv.textContent = item.title; // XSS 방지: textContent 사용

      const descDiv = document.createElement('div');
      descDiv.className = 'zm-slash-menu-item-description';
      descDiv.textContent = item.description; // XSS 방지: textContent 사용

      itemDiv.appendChild(titleDiv);
      itemDiv.appendChild(descDiv);
      this.element!.appendChild(itemDiv);

      // 클릭 이벤트 바인딩 (핸들러 저장하여 나중에 제거)
      const handler = () => {
        this.props.command(item);
      };
      itemDiv.addEventListener('click', handler);
      this.clickHandlers.push({ element: itemDiv, handler });

      // 마우스 호버 시 선택
      itemDiv.addEventListener('mouseenter', () => {
        this.selectedIndex = index;
        this.updateSelection();
      });
    });
  }

  private updateSelection() {
    // 선택 상태만 업데이트 (전체 리렌더링 방지)
    if (!this.element) return;
    const items = this.element.querySelectorAll('.zm-slash-menu-item');
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  }

  destroy() {
    this.removeEventListeners();
    this.element?.remove();
    this.element = null;
    this.selectedIndex = 0;
  }
}

export default ZmEditor;
