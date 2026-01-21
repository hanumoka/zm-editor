import { useEditor, type UseEditorOptions } from '@tiptap/react';
import {
  createStarterExtensions,
  SlashCommand,
  defaultSlashCommands,
  type ZmStarterKitOptions,
} from '@zm-editor/core';

export interface UseZmEditorOptions
  extends Omit<UseEditorOptions, 'extensions'> {
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 글자 수 제한 */
  characterLimit?: number;
  /** 슬래시 명령어 활성화 */
  enableSlashCommand?: boolean;
}

/**
 * useZmEditor - zm-editor용 커스텀 훅
 *
 * Tiptap useEditor 훅을 zm-editor 기본 설정으로 래핑합니다.
 */
export function useZmEditor(options: UseZmEditorOptions = {}) {
  const {
    placeholder = "Type '/' for commands...",
    characterLimit = 50000,
    enableSlashCommand = true,
    ...editorOptions
  } = options;

  const extensions = [
    ...createStarterExtensions({
      placeholder,
      characterLimit,
    } as ZmStarterKitOptions),
    ...(enableSlashCommand
      ? [
          SlashCommand.configure({
            suggestion: {
              items: ({ query }: { query: string }) => {
                return defaultSlashCommands.filter((item) => {
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
            },
          }),
        ]
      : []),
  ];

  return useEditor({
    extensions,
    immediatelyRender: false,
    ...editorOptions,
  });
}

export default useZmEditor;
