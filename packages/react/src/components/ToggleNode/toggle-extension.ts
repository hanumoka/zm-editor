import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ToggleNode } from './ToggleNode';

export interface ToggleOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    toggle: {
      /**
       * Insert a toggle block
       */
      setToggle: () => ReturnType;
    };
  }
}

/**
 * Toggle Extension - Notion-like 접기/펼치기 블록
 */
export const Toggle = Node.create<ToggleOptions>({
  name: 'toggle',

  group: 'block',

  content: 'block+',

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'zm-toggle',
      },
    };
  },

  addAttributes() {
    return {
      title: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-title') || '',
        renderHTML: (attributes) => ({
          'data-title': attributes.title,
        }),
      },
      open: {
        default: true,
        parseHTML: (element) => element.getAttribute('data-open') !== 'false',
        renderHTML: (attributes) => ({
          'data-open': attributes.open ? 'true' : 'false',
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-toggle]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-toggle': '',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setToggle:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              title: '',
              open: true,
            },
            content: [
              {
                type: 'paragraph',
              },
            ],
          });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      // Backspace at start of empty toggle should unwrap
      Backspace: ({ editor }) => {
        const { $from, empty } = editor.state.selection;

        if (!empty || $from.parent.type.name !== 'paragraph') {
          return false;
        }

        // Check if we're at the start of the first block in a toggle
        const toggle = $from.node(-1);
        if (toggle?.type.name !== 'toggle') {
          return false;
        }

        // Check if paragraph is empty and at start
        if ($from.parent.textContent.length > 0 || $from.parentOffset !== 0) {
          return false;
        }

        // Check if this is the first child
        const indexInToggle = $from.index(-1);
        if (indexInToggle !== 0) {
          return false;
        }

        // Check if title is also empty
        const title = toggle.attrs.title;
        if (title && title.length > 0) {
          return false;
        }

        return editor.commands.lift('toggle');
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ToggleNode);
  },
});

export default Toggle;
