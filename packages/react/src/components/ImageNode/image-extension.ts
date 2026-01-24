import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ImageNode } from './ImageNode';

export interface ResizableImageOptions {
  /** 인라인 이미지 허용 여부 */
  inline: boolean;
  /** Base64 이미지 허용 여부 */
  allowBase64: boolean;
  /** HTML 속성 */
  HTMLAttributes: Record<string, unknown>;
}

/**
 * ResizableImage - Notion-like 리사이즈 가능한 이미지 확장
 *
 * 기본 @tiptap/extension-image를 확장하여:
 * - 드래그로 크기 조절
 * - 정렬 옵션 (좌/중앙/우)
 * - 선택 시 컨트롤 UI 표시
 */
export const ResizableImage = Image.extend<ResizableImageOptions>({
  name: 'image',

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute('width') || element.style.width;
          return width ? parseInt(width, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
            style: `width: ${attributes.width}px`,
          };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const height = element.getAttribute('height') || element.style.height;
          return height ? parseInt(height, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {};
          }
          return {
            height: attributes.height,
          };
        },
      },
      alignment: {
        default: 'center',
        parseHTML: (element) => {
          return element.getAttribute('data-alignment') || 'center';
        },
        renderHTML: (attributes) => {
          return {
            'data-alignment': attributes.alignment,
          };
        },
      },
      caption: {
        default: '',
        parseHTML: (element) => {
          return element.getAttribute('data-caption') || '';
        },
        renderHTML: (attributes) => {
          if (!attributes.caption) {
            return {};
          }
          return {
            'data-caption': attributes.caption,
          };
        },
      },
      uploading: {
        default: false,
        parseHTML: () => false,
        renderHTML: (attributes) => {
          if (!attributes.uploading) {
            return {};
          }
          return {
            'data-uploading': 'true',
          };
        },
      },
      uploadProgress: {
        default: 0,
        parseHTML: () => 0,
        renderHTML: () => ({}),
      },
      fileName: {
        default: '',
        parseHTML: () => '',
        renderHTML: () => ({}),
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNode);
  },
});

export default ResizableImage;
