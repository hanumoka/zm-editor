/**
 * 목차(Table of Contents) 유틸리티
 *
 * 에디터 콘텐츠에서 제목(heading)을 추출하여 목차 데이터 생성
 */

import type { JSONContent } from '@tiptap/core';

/**
 * 목차 항목 타입
 */
export interface TocItem {
  /** 제목 레벨 (1-6) */
  level: number;
  /** 제목 텍스트 */
  text: string;
  /** 앵커 ID (URL-safe) */
  id: string;
}

/**
 * 목차 추출 옵션
 */
export interface TocOptions {
  /** 포함할 최소 제목 레벨 (기본: 1) */
  minLevel?: number;
  /** 포함할 최대 제목 레벨 (기본: 3) */
  maxLevel?: number;
  /** TOC 노드 내의 제목 제외 여부 (기본: true) */
  excludeTocNode?: boolean;
}

const DEFAULT_OPTIONS: Required<TocOptions> = {
  minLevel: 1,
  maxLevel: 3,
  excludeTocNode: true,
};

/**
 * JSONContent에서 목차 추출
 *
 * @param json - 에디터 JSON 콘텐츠
 * @param options - 추출 옵션
 * @returns 목차 항목 배열
 *
 * @example
 * ```ts
 * const json = editor.getJSON();
 * const toc = extractTableOfContents(json);
 * // [{ level: 1, text: '소개', id: 'introduction' }, ...]
 * ```
 */
export function extractTableOfContents(
  json: JSONContent,
  options: TocOptions = {}
): TocItem[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const headings: TocItem[] = [];
  const usedIds = new Set<string>();

  function traverse(node: JSONContent, insideToc = false): void {
    // TOC 노드 내부는 건너뛰기
    if (opts.excludeTocNode && node.type === 'toc') {
      return;
    }

    // 제목 노드 처리
    if (node.type === 'heading' && node.attrs?.level) {
      const level = node.attrs.level as number;

      // 레벨 범위 체크
      if (level >= opts.minLevel && level <= opts.maxLevel) {
        const text = extractTextContent(node);
        if (text.trim()) {
          const id = generateUniqueId(text, usedIds);
          usedIds.add(id);

          headings.push({
            level,
            text: text.trim(),
            id,
          });
        }
      }
    }

    // 자식 노드 재귀 처리
    if (node.content && Array.isArray(node.content)) {
      for (const child of node.content) {
        traverse(child, insideToc || node.type === 'toc');
      }
    }
  }

  traverse(json);
  return headings;
}

/**
 * 노드에서 텍스트 콘텐츠 추출 (재귀)
 */
function extractTextContent(node: JSONContent): string {
  if (node.type === 'text' && node.text) {
    return node.text;
  }

  if (!node.content || !Array.isArray(node.content)) {
    return '';
  }

  return node.content.map(extractTextContent).join('');
}

/**
 * 텍스트에서 URL-safe 앵커 ID 생성
 */
function generateAnchorId(text: string): string {
  return text
    .toLowerCase()
    // 한글, 영문, 숫자, 공백, 하이픈만 유지
    .replace(/[^\w\s\u3131-\uD79D-]/g, '')
    // 공백을 하이픈으로
    .replace(/\s+/g, '-')
    // 연속 하이픈 제거
    .replace(/-+/g, '-')
    // 시작/끝 하이픈 제거
    .replace(/^-|-$/g, '')
    // 빈 문자열이면 기본값
    || 'heading';
}

/**
 * 중복 없는 고유 ID 생성
 */
function generateUniqueId(text: string, usedIds: Set<string>): string {
  const baseId = generateAnchorId(text);
  let id = baseId;
  let counter = 1;

  while (usedIds.has(id)) {
    id = `${baseId}-${counter}`;
    counter++;
  }

  return id;
}

/**
 * 목차를 마크다운 형식으로 변환
 *
 * @param toc - 목차 항목 배열
 * @returns 마크다운 문자열
 *
 * @example
 * ```ts
 * const toc = extractTableOfContents(json);
 * const md = tocToMarkdown(toc);
 * // - [소개](#introduction)
 * //   - [시작하기](#getting-started)
 * ```
 */
export function tocToMarkdown(toc: TocItem[]): string {
  if (toc.length === 0) return '';

  const minLevel = Math.min(...toc.map((item) => item.level));

  return toc
    .map((item) => {
      const indent = '  '.repeat(item.level - minLevel);
      return `${indent}- [${item.text}](#${item.id})`;
    })
    .join('\n');
}

/**
 * 목차를 HTML 형식으로 변환
 *
 * @param toc - 목차 항목 배열
 * @param className - 루트 ul 클래스명
 * @returns HTML 문자열
 */
export function tocToHtml(toc: TocItem[], className = 'zm-toc'): string {
  if (toc.length === 0) {
    return `<div class="${className} ${className}-empty">No headings found</div>`;
  }

  const minLevel = Math.min(...toc.map((item) => item.level));

  const items = toc
    .map((item) => {
      const levelClass = `${className}-item-level-${item.level}`;
      const indent = item.level - minLevel;
      const paddingLeft = indent * 16; // 16px per level

      return `<li class="${className}-item ${levelClass}" style="padding-left: ${paddingLeft}px;">
        <a href="#${item.id}" class="${className}-link">${escapeHtml(item.text)}</a>
      </li>`;
    })
    .join('\n');

  return `<nav class="${className}">
    <ul class="${className}-list">
      ${items}
    </ul>
  </nav>`;
}

/**
 * HTML 특수문자 이스케이프
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}
