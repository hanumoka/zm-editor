import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CalloutNode } from './CalloutNode';

export type CalloutColor = 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple';

export interface CalloutOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      /**
       * Insert a callout block
       */
      setCallout: (options?: { emoji?: string; color?: CalloutColor }) => ReturnType;
      /**
       * Toggle callout block
       */
      toggleCallout: (options?: { emoji?: string; color?: CalloutColor }) => ReturnType;
    };
  }
}

/**
 * Callout Extension - Notion-like 강조 박스
 */
export const Callout = Node.create<CalloutOptions>({
  name: 'callout',

  group: 'block',

  content: 'block+',

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'zm-callout',
      },
    };
  },

  addAttributes() {
    return {
      emoji: {
        default: '💡',
        parseHTML: (element) => element.getAttribute('data-emoji') || '💡',
        renderHTML: (attributes) => ({
          'data-emoji': attributes.emoji,
        }),
      },
      color: {
        default: 'gray',
        parseHTML: (element) => element.getAttribute('data-color') || 'gray',
        renderHTML: (attributes) => ({
          'data-color': attributes.color,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-callout]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-callout': '',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCallout:
        (options = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              emoji: options.emoji || '💡',
              color: options.color || 'gray',
            },
            content: [
              {
                type: 'paragraph',
              },
            ],
          });
        },
      toggleCallout:
        (options = {}) =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, {
            emoji: options.emoji || '💡',
            color: options.color || 'gray',
          });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      // Backspace at start of empty callout should unwrap
      Backspace: ({ editor }) => {
        const { $from, empty } = editor.state.selection;

        if (!empty || $from.parent.type.name !== 'paragraph') {
          return false;
        }

        // Check if we're at the start of the first block in a callout
        const callout = $from.node(-1);
        if (callout?.type.name !== 'callout') {
          return false;
        }

        // Check if paragraph is empty and at start
        if ($from.parent.textContent.length > 0 || $from.parentOffset !== 0) {
          return false;
        }

        // Check if this is the first child
        const indexInCallout = $from.index(-1);
        if (indexInCallout !== 0) {
          return false;
        }

        return editor.commands.lift('callout');
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutNode);
  },
});

export default Callout;
