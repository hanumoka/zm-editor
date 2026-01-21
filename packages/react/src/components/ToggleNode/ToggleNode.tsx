import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react';
import { useCallback, useRef, useEffect } from 'react';

export type ToggleNodeProps = NodeViewProps;

/**
 * ToggleNode - Notion-like 접기/펼치기 블록 NodeView
 */
export function ToggleNode({ node, updateAttributes, selected }: ToggleNodeProps) {
  const { title = '', open = true } = node.attrs;
  const titleInputRef = useRef<HTMLInputElement>(null);

  // 토글 상태 변경
  const handleToggle = useCallback(() => {
    updateAttributes({ open: !open });
  }, [open, updateAttributes]);

  // 제목 변경
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateAttributes({ title: e.target.value });
    },
    [updateAttributes]
  );

  // 제목 입력에서 Enter 시 콘텐츠로 포커스 이동
  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        // 콘텐츠 영역으로 포커스 이동
        const contentEl = document.querySelector('.zm-toggle-content-inner');
        if (contentEl) {
          (contentEl as HTMLElement).focus();
        }
      }
    },
    []
  );

  // 새로 생성된 토글은 제목에 포커스
  useEffect(() => {
    if (!title && titleInputRef.current && selected) {
      titleInputRef.current.focus();
    }
  }, []);

  return (
    <NodeViewWrapper className="zm-toggle-node-wrapper">
      <div
        className={`zm-toggle-node ${selected ? 'is-selected' : ''} ${open ? 'is-open' : ''}`}
      >
        {/* 토글 헤더 */}
        <div className="zm-toggle-header">
          <button
            type="button"
            className="zm-toggle-arrow"
            onClick={handleToggle}
            contentEditable={false}
          >
            <ChevronIcon />
          </button>
          <input
            ref={titleInputRef}
            type="text"
            className="zm-toggle-title"
            value={title}
            onChange={handleTitleChange}
            onKeyDown={handleTitleKeyDown}
            placeholder="Toggle title..."
            contentEditable={false}
          />
        </div>

        {/* 토글 콘텐츠 (접혀있으면 숨김) */}
        <div
          className="zm-toggle-content"
          style={{ display: open ? 'block' : 'none' }}
        >
          <NodeViewContent className="zm-toggle-content-inner" />
        </div>
      </div>
    </NodeViewWrapper>
  );
}

// Icons
function ChevronIcon() {
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
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export default ToggleNode;
