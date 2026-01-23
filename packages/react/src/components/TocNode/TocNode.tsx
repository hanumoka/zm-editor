'use client';

import { useMemo, useCallback } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { extractTableOfContents, type TocItem } from '@zm-editor/core';

export interface TocNodeProps extends NodeViewProps {}

/**
 * TocNode - 자동 목차 생성 컴포넌트
 *
 * 에디터 내의 제목(heading)을 자동으로 수집하여 목차를 렌더링합니다.
 */
export function TocNode({ editor, node, selected }: TocNodeProps) {
  const maxLevel = node.attrs.maxLevel || 3;

  // 에디터 콘텐츠에서 제목 추출
  const headings = useMemo(() => {
    const json = editor.getJSON();
    return extractTableOfContents(json, {
      minLevel: 1,
      maxLevel,
      excludeTocNode: true,
    });
  }, [editor, maxLevel, editor.state.doc]);

  // 제목 클릭 핸들러 (스크롤)
  const handleHeadingClick = useCallback(
    (item: TocItem) => {
      // 에디터 내에서 해당 제목으로 스크롤
      // ProseMirror의 DOM에서 제목을 찾아 스크롤
      const headingElements = editor.view.dom.querySelectorAll('h1, h2, h3, h4, h5, h6');

      for (const el of headingElements) {
        const text = el.textContent?.trim();
        const level = parseInt(el.tagName.charAt(1), 10);

        if (text === item.text && level === item.level) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          break;
        }
      }
    },
    [editor]
  );

  const minLevel = headings.length > 0 ? Math.min(...headings.map((h) => h.level)) : 1;

  return (
    <NodeViewWrapper className="zm-toc-node-wrapper">
      <div
        className={`zm-toc-node ${selected ? 'is-selected' : ''}`}
        contentEditable={false}
      >
        <div className="zm-toc-header">
          <span className="zm-toc-icon">
            <ListIcon />
          </span>
          <span className="zm-toc-title">Table of Contents</span>
        </div>

        {headings.length === 0 ? (
          <div className="zm-toc-empty">
            No headings found. Add headings (H1-H{maxLevel}) to generate a table of contents.
          </div>
        ) : (
          <nav className="zm-toc-list">
            {headings.map((item, index) => (
              <button
                key={`${item.id}-${index}`}
                type="button"
                className={`zm-toc-item zm-toc-item-level-${item.level}`}
                style={{ paddingLeft: `${(item.level - minLevel) * 16 + 8}px` }}
                onClick={() => handleHeadingClick(item)}
              >
                <span className="zm-toc-item-bullet">•</span>
                <span className="zm-toc-item-text">{item.text}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </NodeViewWrapper>
  );
}

// 리스트 아이콘
function ListIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

export default TocNode;
