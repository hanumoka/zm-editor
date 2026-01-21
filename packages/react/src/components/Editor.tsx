'use client';

import { forwardRef, useImperativeHandle, useMemo, useCallback, useEffect, useState } from 'react';
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
import { TableBubbleMenu } from './TableBubbleMenu';
import { CodeBlock } from './CodeBlock';
import { ResizableImage } from './ImageNode';
import { Embed } from './EmbedNode';
import { Callout } from './CalloutNode';
import { Toggle } from './ToggleNode';
import { Bookmark } from './BookmarkNode';
import type { ZmEditorLocale } from '../locales';
import { enLocale } from '../locales';

// ===== 이미지 업로드 관련 타입 =====

/** 이미지 업로드 결과 */
export interface ImageUploadResult {
  /** 업로드된 이미지 URL (필수) */
  url: string;
  /** alt 텍스트 (선택) */
  alt?: string;
  /** 이미지 제목 (선택) */
  title?: string;
}

/** 이미지 업로드 옵션 */
export interface ImageUploadOptions {
  /** 업로드할 파일 */
  file: File;
  /** 업로드 진행률 콜백 (0-100) */
  onProgress?: (percent: number) => void;
}

/** 이미지 업로드 핸들러 타입 */
export type ImageUploadHandler = (options: ImageUploadOptions) => Promise<ImageUploadResult>;

/** 이미지 업로드 설정 */
export interface ImageUploadConfig {
  /** 최대 파일 크기 (바이트, 기본: 5MB) */
  maxSizeBytes?: number;
  /** 허용 MIME 타입 (기본: png, jpeg, gif, webp) */
  allowedMimeTypes?: string[];
  /** 클립보드 붙여넣기 허용 (기본: true) */
  enablePaste?: boolean;
  /** 드래그앤드롭 허용 (기본: true) */
  enableDrop?: boolean;
  /** onImageUpload 없을 때 Base64 폴백 사용 (기본: true) */
  fallbackToBase64?: boolean;
}

// 기본 이미지 설정
const DEFAULT_IMAGE_CONFIG: Required<ImageUploadConfig> = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
  enablePaste: true,
  enableDrop: true,
  fallbackToBase64: true,
};

/** 파일을 Base64로 변환 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** 이미지 파일 유효성 검사 */
function validateImageFile(
  file: File,
  config: Required<ImageUploadConfig>
): { valid: boolean; error?: string } {
  if (!config.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed: ${config.allowedMimeTypes.join(', ')}`,
    };
  }

  if (file.size > config.maxSizeBytes) {
    const maxMB = (config.maxSizeBytes / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File too large: ${(file.size / (1024 * 1024)).toFixed(1)}MB. Max: ${maxMB}MB`,
    };
  }

  return { valid: true };
}

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
  /** 테이블 버블 메뉴 활성화 */
  enableTableBubbleMenu?: boolean;
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
  /** 이미지 업로드 핸들러 (없으면 Base64 폴백 또는 비활성화) */
  onImageUpload?: ImageUploadHandler;
  /** 이미지 업로드 설정 */
  imageConfig?: ImageUploadConfig;
  /** 이미지 업로드 에러 핸들러 */
  onImageUploadError?: (error: Error, file: File) => void;
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
    {
      title: commands.table.title,
      description: commands.table.description,
      searchTerms: ['table', 'grid', 'spreadsheet', 'rows', 'columns'],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
      },
    },
    {
      title: commands.image.title,
      description: commands.image.description,
      searchTerms: ['image', 'picture', 'photo', 'img', 'upload'],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        // 파일 선택 다이얼로그 트리거
        const fileInput = document.getElementById('zm-editor-image-upload') as HTMLInputElement;
        if (fileInput) {
          fileInput.click();
        }
      },
    },
    {
      title: commands.embed.title,
      description: commands.embed.description,
      searchTerms: ['embed', 'youtube', 'vimeo', 'video', 'twitter', 'codepen', 'codesandbox'],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setEmbed({ src: '' }).run();
      },
    },
    {
      title: commands.callout.title,
      description: commands.callout.description,
      searchTerms: ['callout', 'note', 'info', 'warning', 'tip', 'alert', 'box'],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setCallout().run();
      },
    },
    {
      title: commands.toggle.title,
      description: commands.toggle.description,
      searchTerms: ['toggle', 'collapse', 'expand', 'accordion', 'dropdown', 'fold'],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setToggle().run();
      },
    },
    {
      title: commands.bookmark.title,
      description: commands.bookmark.description,
      searchTerms: ['bookmark', 'link', 'preview', 'url', 'website', 'web'],
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setBookmark().run();
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
      enableTableBubbleMenu = true,
      slashCommands,
      autoFocus = false,
      extensions: customExtensions = [],
      shouldRerenderOnTransaction = false,
      locale = enLocale,
      onImageUpload,
      imageConfig,
      onImageUploadError,
    },
    ref
  ) => {
    // 이미지 설정 병합
    const mergedImageConfig = useMemo<Required<ImageUploadConfig>>(
      () => ({ ...DEFAULT_IMAGE_CONFIG, ...imageConfig }),
      [imageConfig]
    );

    // 업로드 중인 파일 수 추적
    const [uploadingCount, setUploadingCount] = useState(0);

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
        excludeImage: true, // React NodeView (ResizableImage) 사용을 위해 제외
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
              items: ({ query, editor: suggestionEditor }: { query: string; editor: TiptapEditor }) => {
                const isInTable = suggestionEditor.isActive('table');

                return localizedSlashCommands.filter((item) => {
                  // 테이블 내부에서 제한된 명령어 필터링 (Notion-like)
                  if (isInTable && item.searchTerms) {
                    const restrictedTerms = ['table', 'h1', 'h2', 'h3', 'hr', 'code'];
                    const isRestricted = restrictedTerms.some((term) =>
                      item.searchTerms?.includes(term)
                    );
                    if (isRestricted) {
                      return false;
                    }
                  }

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

      // 리사이즈 가능한 이미지 확장
      const resizableImageExtension = ResizableImage.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'zm-image',
        },
      });

      // 임베드 확장 (YouTube, Vimeo, Twitter 등)
      const embedExtension = Embed.configure({
        HTMLAttributes: {
          class: 'zm-embed',
        },
      });

      // Callout 확장 (강조 박스)
      const calloutExtension = Callout.configure({
        HTMLAttributes: {
          class: 'zm-callout',
        },
      });

      // Toggle 확장 (접기/펼치기)
      const toggleExtension = Toggle.configure({
        HTMLAttributes: {
          class: 'zm-toggle',
        },
      });

      // Bookmark 확장 (링크 미리보기 카드)
      const bookmarkExtension = Bookmark.configure({
        HTMLAttributes: {
          class: 'zm-bookmark',
        },
      });

      return [
        ...baseExtensions,
        codeBlockExtension,
        resizableImageExtension,
        embedExtension,
        calloutExtension,
        toggleExtension,
        bookmarkExtension,
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

    // 이미지 파일 처리 (에디터에 삽입)
    const processImageFile = useCallback(
      async (file: File) => {
        if (!editor) return;

        const validation = validateImageFile(file, mergedImageConfig);
        if (!validation.valid) {
          const error = new Error(validation.error);
          onImageUploadError?.(error, file);
          console.error('[ZmEditor] Image validation failed:', validation.error);
          return;
        }

        // 업로드 시작
        setUploadingCount((prev) => prev + 1);

        try {
          let imageUrl: string;
          let alt: string | undefined;

          if (onImageUpload) {
            const result = await onImageUpload({ file });
            imageUrl = result.url;
            alt = result.alt;
          } else if (mergedImageConfig.fallbackToBase64) {
            imageUrl = await fileToBase64(file);
            alt = file.name;
          } else {
            console.warn('[ZmEditor] Image upload disabled');
            setUploadingCount((prev) => Math.max(0, prev - 1));
            return;
          }

          // 에디터에 이미지 삽입
          editor.chain().focus().setImage({ src: imageUrl, alt: alt || file.name }).run();
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Image upload failed');
          onImageUploadError?.(error, file);
          console.error('[ZmEditor] Image upload failed:', error);
        } finally {
          // 업로드 완료
          setUploadingCount((prev) => Math.max(0, prev - 1));
        }
      },
      [editor, onImageUpload, mergedImageConfig, onImageUploadError]
    );

    // 드래그앤드롭 및 붙여넣기 이벤트 핸들러
    useEffect(() => {
      if (!editor || readOnly) return;

      const editorElement = editor.view.dom;

      // 드래그앤드롭 핸들러
      const handleDrop = (event: DragEvent) => {
        if (!mergedImageConfig.enableDrop) return;

        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return;

        const imageFiles = Array.from(files).filter((file) =>
          mergedImageConfig.allowedMimeTypes.includes(file.type)
        );

        if (imageFiles.length > 0) {
          event.preventDefault();
          event.stopPropagation();
          imageFiles.forEach((file) => processImageFile(file));
        }
      };

      // 드래그오버 핸들러 (드롭 허용)
      const handleDragOver = (event: DragEvent) => {
        if (!mergedImageConfig.enableDrop) return;
        event.preventDefault();
      };

      // 붙여넣기 핸들러
      const handlePaste = (event: ClipboardEvent) => {
        if (!mergedImageConfig.enablePaste) return;

        const files = event.clipboardData?.files;
        if (!files || files.length === 0) return;

        const imageFiles = Array.from(files).filter((file) =>
          mergedImageConfig.allowedMimeTypes.includes(file.type)
        );

        if (imageFiles.length > 0) {
          event.preventDefault();
          event.stopPropagation();
          imageFiles.forEach((file) => processImageFile(file));
        }
      };

      editorElement.addEventListener('drop', handleDrop);
      editorElement.addEventListener('dragover', handleDragOver);
      editorElement.addEventListener('paste', handlePaste);

      return () => {
        editorElement.removeEventListener('drop', handleDrop);
        editorElement.removeEventListener('dragover', handleDragOver);
        editorElement.removeEventListener('paste', handlePaste);
      };
    }, [editor, readOnly, mergedImageConfig, processImageFile]);

    // 파일 선택 핸들러 (슬래시 명령어에서 트리거)
    // Hooks는 조건부 return 전에 호출되어야 함
    const handleFileInputChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
          Array.from(files).forEach((file) => processImageFile(file));
        }
        // input 초기화 (같은 파일 다시 선택 가능하도록)
        event.target.value = '';
      },
      [processImageFile]
    );

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
        {/* 숨겨진 파일 input (슬래시 명령어에서 사용) */}
        <input
          id="zm-editor-image-upload"
          type="file"
          accept={mergedImageConfig.allowedMimeTypes.join(',')}
          multiple
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />
        {enableBubbleMenu && (
          <BubbleMenu
            editor={editor}
            locale={locale.bubbleMenu}
            dialogLocale={locale.dialogs}
          />
        )}
        {enableTableBubbleMenu && (
          <TableBubbleMenu
            editor={editor}
            locale={locale.tableBubbleMenu}
          />
        )}
        <EditorContent editor={editor} />
        {/* 이미지 업로드 중 인디케이터 */}
        {uploadingCount > 0 && (
          <div className="zm-editor-upload-indicator">
            <div className="zm-editor-upload-indicator-spinner" />
            <span className="zm-editor-upload-indicator-text">
              {locale.editor.uploading ?? 'Uploading image...'}
            </span>
          </div>
        )}
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
  private keydownHandler: ((event: KeyboardEvent) => void) | null = null;

  constructor(props: SlashMenuRenderProps) {
    this.props = props;
    this.render();
    this.addGlobalKeydownListener();
  }

  // 전역 keydown 리스너 추가 (테이블 셀에서 화살표 키 충돌 방지)
  private addGlobalKeydownListener() {
    this.keydownHandler = (event: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(event.key)) {
        // 이벤트 전파 중단하여 테이블 키보드 핸들링 방지
        event.preventDefault();
        event.stopPropagation();

        if (event.key === 'Escape') {
          this.destroy();
        } else {
          this.onKeyDown(event);
        }
      }
    };
    // capture phase에서 이벤트를 가로채서 다른 핸들러보다 먼저 처리
    document.addEventListener('keydown', this.keydownHandler, true);
  }

  private removeGlobalKeydownListener() {
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler, true);
      this.keydownHandler = null;
    }
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
    this.removeGlobalKeydownListener();
    this.removeEventListeners();
    this.element?.remove();
    this.element = null;
    this.selectedIndex = 0;
  }
}

export default ZmEditor;
