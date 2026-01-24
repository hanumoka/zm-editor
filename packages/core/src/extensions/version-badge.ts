import { Mark, mergeAttributes } from '@tiptap/core';

export interface VersionBadgeOptions {
  HTMLAttributes: Record<string, unknown>;
}

export type BadgeType = 'version' | 'since' | 'deprecated' | 'beta' | 'new';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    versionBadge: {
      /**
       * Set a version badge mark with specified version and type
       */
      setVersionBadge: (options: { version: string; badgeType?: BadgeType }) => ReturnType;
      /**
       * Toggle a version badge mark
       */
      toggleVersionBadge: (options: { version: string; badgeType?: BadgeType }) => ReturnType;
      /**
       * Unset a version badge mark
       */
      unsetVersionBadge: () => ReturnType;
    };
  }
}

/**
 * VersionBadge Extension - 버전 배지 / Since 태그
 *
 * 인라인 배지로 버전 정보를 표시합니다.
 * 타입: version, since, deprecated, beta, new
 */
export const VersionBadge = Mark.create<VersionBadgeOptions>({
  name: 'versionBadge',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'zm-version-badge',
      },
    };
  },

  addAttributes() {
    return {
      version: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-version') || '',
        renderHTML: (attributes) => {
          if (!attributes.version) return {};
          return { 'data-version': attributes.version };
        },
      },
      badgeType: {
        default: 'version',
        parseHTML: (element) => element.getAttribute('data-badge-type') || 'version',
        renderHTML: (attributes) => {
          return { 'data-badge-type': attributes.badgeType || 'version' };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-version-badge]',
      },
      {
        tag: 'span.zm-version-badge',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-version-badge': '' }),
      0,
    ];
  },

  addCommands() {
    return {
      setVersionBadge:
        (options) =>
        ({ commands }) => {
          return commands.setMark(this.name, options);
        },
      toggleVersionBadge:
        (options) =>
        ({ commands }) => {
          return commands.toggleMark(this.name, options);
        },
      unsetVersionBadge:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      // Mod+Shift+V로 version badge 토글
      'Mod-Shift-v': () => this.editor.commands.toggleVersionBadge({ version: '', badgeType: 'version' }),
    };
  },
});

export default VersionBadge;
