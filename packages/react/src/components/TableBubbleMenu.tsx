import { BubbleMenu as TiptapBubbleMenu, Editor } from '@tiptap/react';
import { useCallback, useState, useRef, useEffect } from 'react';
import type { TableBubbleMenuLocale } from '../locales';
import { enLocale } from '../locales';

// 셀 배경색 프리셋
const CELL_BACKGROUND_COLORS = [
  { name: 'Default', value: null },
  { name: 'Gray', value: '#f3f4f6' },
  { name: 'Red', value: '#fef2f2' },
  { name: 'Orange', value: '#fff7ed' },
  { name: 'Yellow', value: '#fefce8' },
  { name: 'Green', value: '#f0fdf4' },
  { name: 'Blue', value: '#eff6ff' },
  { name: 'Purple', value: '#faf5ff' },
  { name: 'Pink', value: '#fdf2f8' },
];

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
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 색상 선택기 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker]);

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

  const setCellBackground = useCallback((color: string | null) => {
    if (color === null) {
      editor.chain().focus().setCellAttribute('backgroundColor', null).run();
    } else {
      editor.chain().focus().setCellAttribute('backgroundColor', color).run();
    }
    setShowColorPicker(false);
  }, [editor]);

  const toggleColorPicker = useCallback(() => {
    setShowColorPicker((prev) => !prev);
  }, []);

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

      {/* Cell Background Color */}
      <div className="zm-table-bubble-menu-group zm-table-color-picker-container" ref={colorPickerRef}>
        <button
          type="button"
          onClick={toggleColorPicker}
          className={`zm-table-bubble-menu-button ${showColorPicker ? 'is-active' : ''}`}
          title={locale.cellBackground}
        >
          <CellBackgroundIcon />
        </button>
        {showColorPicker && (
          <div className="zm-table-color-picker">
            {CELL_BACKGROUND_COLORS.map((color) => (
              <button
                key={color.name}
                type="button"
                className="zm-table-color-option"
                style={{ backgroundColor: color.value || 'transparent' }}
                onClick={() => setCellBackground(color.value)}
                title={color.value === null ? (locale.clearBackground || 'Clear') : color.name}
              >
                {color.value === null && <ClearIcon />}
              </button>
            ))}
          </div>
        )}
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

function CellBackgroundIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <rect x="6" y="6" width="12" height="12" fill="currentColor" fillOpacity="0.2" stroke="none" />
      <circle cx="18" cy="18" r="5" fill="#3b82f6" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="4" y1="4" x2="20" y2="20" />
      <line x1="20" y1="4" x2="4" y2="20" />
    </svg>
  );
}

export default TableBubbleMenu;
