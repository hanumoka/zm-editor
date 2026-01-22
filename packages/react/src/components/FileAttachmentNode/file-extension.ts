import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { FileAttachmentNode } from './FileAttachmentNode';

export interface FileAttachmentOptions {
  /** HTML 속성 */
  HTMLAttributes: Record<string, unknown>;
}

export interface FileAttachmentAttributes {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  caption: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fileAttachment: {
      /**
       * Insert a file attachment
       */
      setFileAttachment: (options: Partial<FileAttachmentAttributes>) => ReturnType;
    };
  }
}

/**
 * FileAttachment - 파일 첨부 노드 확장
 *
 * 파일을 첨부하고 다운로드 링크를 제공하는 노드
 * - 파일 타입별 아이콘 표시
 * - 파일명, 크기 표시
 * - 다운로드 버튼
 * - 캡션 편집
 */
export const FileAttachment = Node.create<FileAttachmentOptions>({
  name: 'fileAttachment',

  group: 'block',

  atom: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      url: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-url') || '',
        renderHTML: (attributes) => ({
          'data-url': attributes.url,
        }),
      },
      fileName: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-filename') || '',
        renderHTML: (attributes) => ({
          'data-filename': attributes.fileName,
        }),
      },
      fileSize: {
        default: 0,
        parseHTML: (element) => {
          const size = element.getAttribute('data-filesize');
          return size ? parseInt(size, 10) : 0;
        },
        renderHTML: (attributes) => ({
          'data-filesize': attributes.fileSize,
        }),
      },
      mimeType: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-mimetype') || '',
        renderHTML: (attributes) => ({
          'data-mimetype': attributes.mimeType,
        }),
      },
      caption: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-caption') || '',
        renderHTML: (attributes) => {
          if (!attributes.caption) {
            return {};
          }
          return {
            'data-caption': attributes.caption,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="file-attachment"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'file-attachment',
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileAttachmentNode);
  },

  addCommands() {
    return {
      setFileAttachment:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              url: options.url || '',
              fileName: options.fileName || '',
              fileSize: options.fileSize || 0,
              mimeType: options.mimeType || '',
              caption: options.caption || '',
            },
          });
        },
    };
  },
});

export default FileAttachment;
