import type { Editor } from '@tiptap/core';
import type { JSONContent } from '@tiptap/core';

// 마크다운 변환 유틸리티
export { htmlToMarkdown, markdownToHtml } from './markdown';

/**
 * 에디터 콘텐츠를 JSON으로 내보내기
 */
export function exportJSON(editor: Editor): JSONContent {
  return editor.getJSON();
}

/**
 * 에디터 콘텐츠를 HTML로 내보내기
 */
export function exportHTML(editor: Editor): string {
  return editor.getHTML();
}

/**
 * 에디터 콘텐츠를 텍스트로 내보내기
 */
export function exportText(editor: Editor): string {
  return editor.getText();
}

/**
 * 에디터가 비어있는지 확인
 */
export function isEmpty(editor: Editor): boolean {
  return editor.isEmpty;
}

/**
 * 현재 글자 수 반환
 */
export function getCharacterCount(editor: Editor): number {
  return editor.storage.characterCount?.characters() ?? 0;
}

/**
 * 현재 단어 수 반환
 */
export function getWordCount(editor: Editor): number {
  return editor.storage.characterCount?.words() ?? 0;
}

/**
 * URL 유효성 검사
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 문자열에서 URL 추출
 */
export function getUrlFromString(str: string): string | null {
  if (isValidUrl(str)) return str;

  try {
    if (str.includes('.') && !str.includes(' ')) {
      return new URL(`https://${str}`).toString();
    }
  } catch {
    return null;
  }

  return null;
}

export type { JSONContent };
