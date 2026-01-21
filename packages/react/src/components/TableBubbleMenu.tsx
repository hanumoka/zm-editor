import { BubbleMenu as TiptapBubbleMenu, Editor } from '@tiptap/react';
import { useCallback } from 'react';
import type { TableBubbleMenuLocale } from '../locales';
import { enLocale } from '../locales';

interface TableBubbleMenuProps {
  editor: Editor;
  /** 테이블 버블 메뉴 번역 */
  locale?: TableBubbleMenuLocale;
}

/**
 * TableBubbleMenu - 테이블 내 커서 시 나타나는 테이블 제어 메뉴
 */
export function TableBubbleMenu({
  editor,
  locale = enLocale.tableBubbleMenu,
}: TableBubbleMenuProps) {
  const addColumnBefore = useCallback(() => {
    editor.chain().focus().addColumnBefore().run();
  }, [editor]);

  const addColumnAfter = useCallback(() => {
    editor.chain().focus().addColumnAfter().run();
  }, [editor]);

  const deleteColumn = useCallback(() => {
    editor.chain().focus().deleteColumn().run();
  }, [editor]);

  const addRowBefore = useCallback(() => {
    editor.chain().focus().addRowBefore().run();
  }, [editor]);

  const addRowAfter = useCallback(() => {
    editor.chain().focus().addRowAfter().run();
  }, [editor]);

  const deleteRow = useCallback(() => {
    editor.chain().focus().deleteRow().run();
  }, [editor]);

  const deleteTable = useCallback(() => {
    editor.chain().focus().deleteTable().run();
  }, [editor]);

  const mergeCells = useCallback(() => {
    editor.chain().focus().mergeCells().run();
  }, [editor]);

  const splitCell = useCallback(() => {
    editor.chain().focus().splitCell().run();
  }, [editor]);

  const toggleHeaderRow = useCallback(() => {
    editor.chain().focus().toggleHeaderRow().run();
  }, [editor]);

  const toggleHeaderColumn = useCallback(() => {
    editor.chain().focus().toggleHeaderColumn().run();
  }, [editor]);

  const toggleHeaderCell = useCallback(() => {
    editor.chain().focus().toggleHeaderCell().run();
  }, [editor]);

  // 테이블 내부에 있을 때만 표시
  const shouldShow = useCallback(() => {
    return editor.isActive('table');
  }, [editor]);

  return (
    <TiptapBubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      tippyOptions={{
        duration: 100,
        placement: 'top',
        maxWidth: 'none',
      }}
      className="zm-table-bubble-menu"
    >
      {/* Row Controls */}
      <div className="zm-table-bubble-menu-group">
        <button
          type="button"
          onClick={addRowBefore}
          className="zm-table-bubble-menu-button"
          title={locale.addRowBefore}
        >
          <AddRowBeforeIcon />
        </button>
        <button
          type="button"
          onClick={addRowAfter}
          className="zm-table-bubble-menu-button"
          title={locale.addRowAfter}
        >
          <AddRowAfterIcon />
        </button>
        <button
          type="button"
          onClick={deleteRow}
          className="zm-table-bubble-menu-button zm-table-bubble-menu-button-danger"
          title={locale.deleteRow}
        >
          <DeleteRowIcon />
        </button>
      </div>

      <div className="zm-table-bubble-menu-divider" />

      {/* Column Controls */}
      <div className="zm-table-bubble-menu-group">
        <button
          type="button"
          onClick={addColumnBefore}
          className="zm-table-bubble-menu-button"
          title={locale.addColumnBefore}
        >
          <AddColumnBeforeIcon />
        </button>
        <button
          type="button"
          onClick={addColumnAfter}
          className="zm-table-bubble-menu-button"
          title={locale.addColumnAfter}
        >
          <AddColumnAfterIcon />
        </button>
        <button
          type="button"
          onClick={deleteColumn}
          className="zm-table-bubble-menu-button zm-table-bubble-menu-button-danger"
          title={locale.deleteColumn}
        >
          <DeleteColumnIcon />
        </button>
      </div>

      <div className="zm-table-bubble-menu-divider" />

      {/* Cell Controls */}
      <div className="zm-table-bubble-menu-group">
        <button
          type="button"
          onClick={mergeCells}
          className="zm-table-bubble-menu-button"
          title={locale.mergeCells}
          disabled={!editor.can().mergeCells()}
        >
          <MergeCellsIcon />
        </button>
        <button
          type="button"
          onClick={splitCell}
          className="zm-table-bubble-menu-button"
          title={locale.splitCell}
          disabled={!editor.can().splitCell()}
        >
          <SplitCellIcon />
        </button>
      </div>

      <div className="zm-table-bubble-menu-divider" />

      {/* Header Controls */}
      <div className="zm-table-bubble-menu-group">
        <button
          type="button"
          onClick={toggleHeaderRow}
          className="zm-table-bubble-menu-button"
          title={locale.toggleHeaderRow}
        >
          <HeaderRowIcon />
        </button>
        <button
          type="button"
          onClick={toggleHeaderColumn}
          className="zm-table-bubble-menu-button"
          title={locale.toggleHeaderColumn}
        >
          <HeaderColumnIcon />
        </button>
        <button
          type="button"
          onClick={toggleHeaderCell}
          className="zm-table-bubble-menu-button"
          title={locale.toggleHeaderCell}
        >
          <HeaderCellIcon />
        </button>
      </div>

      <div className="zm-table-bubble-menu-divider" />

      {/* Delete Table */}
      <button
        type="button"
        onClick={deleteTable}
        className="zm-table-bubble-menu-button zm-table-bubble-menu-button-danger"
        title={locale.deleteTable}
      >
        <DeleteTableIcon />
      </button>
    </TiptapBubbleMenu>
  );
}

// SVG Icons
function AddRowBeforeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="12" y1="6" x2="12" y2="12" />
      <line x1="9" y1="9" x2="15" y2="9" />
    </svg>
  );
}

function AddRowAfterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="12" y1="12" x2="12" y2="18" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  );
}

function DeleteRowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="9" y1="9" x2="15" y2="15" />
      <line x1="15" y1="9" x2="9" y2="15" />
    </svg>
  );
}

function AddColumnBeforeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="15" y1="3" x2="15" y2="21" />
      <line x1="6" y1="12" x2="12" y2="12" />
      <line x1="9" y1="9" x2="9" y2="15" />
    </svg>
  );
}

function AddColumnAfterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="12" y1="12" x2="18" y2="12" />
      <line x1="15" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function DeleteColumnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="9" y1="9" x2="15" y2="15" />
      <line x1="15" y1="9" x2="9" y2="15" />
    </svg>
  );
}

function MergeCellsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="12" y1="3" x2="12" y2="9" />
      <line x1="12" y1="15" x2="12" y2="21" />
      <line x1="3" y1="12" x2="9" y2="12" />
      <line x1="15" y1="12" x2="21" y2="12" />
      <polyline points="9 9 12 12 9 15" />
      <polyline points="15 9 12 12 15 15" />
    </svg>
  );
}

function SplitCellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="12" y1="3" x2="12" y2="9" />
      <line x1="12" y1="15" x2="12" y2="21" />
      <line x1="3" y1="12" x2="9" y2="12" />
      <line x1="15" y1="12" x2="21" y2="12" />
      <polyline points="12 9 9 12 12 15" />
      <polyline points="12 9 15 12 12 15" />
    </svg>
  );
}

function HeaderRowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <rect x="4" y="4" width="16" height="4" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}

function HeaderColumnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <rect x="4" y="4" width="4" height="16" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}

function HeaderCellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <rect x="4" y="4" width="4" height="4" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}

function DeleteTableIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default TableBubbleMenu;
