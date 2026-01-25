import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import type { SlashCommandItem } from '@zm-editor/core';

export interface SlashMenuProps {
  items: SlashCommandItem[];
  onSelect: (item: SlashCommandItem) => void;
}

export interface SlashMenuRef {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

/**
 * SlashMenu - 슬래시 명령어 메뉴 컴포넌트
 *
 * 이 컴포넌트는 독립적으로 사용하거나,
 * ZmEditor 내부에서 자동으로 렌더링됩니다.
 */
export const SlashMenu = forwardRef<SlashMenuRef, SlashMenuProps>(
  ({ items, onSelect }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // items가 변경되면 선택 인덱스 초기화
    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    // 키보드 네비게이션
    useImperativeHandle(ref, () => ({
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === 'ArrowDown') {
          setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
          return true;
        }

        if (event.key === 'ArrowUp') {
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          return true;
        }

        if (event.key === 'Enter') {
          const item = items[selectedIndex];
          if (item) {
            onSelect(item);
          }
          return true;
        }

        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="zm-slash-menu zm-slash-menu-empty" role="listbox" aria-label="No results">
          No results found
        </div>
      );
    }

    const selectedItemId = items[selectedIndex] ? `slash-menu-item-${selectedIndex}` : undefined;

    return (
      <div
        className="zm-slash-menu"
        role="listbox"
        aria-label="Commands"
        aria-activedescendant={selectedItemId}
      >
        {items.map((item, index) => (
          <button
            key={item.title}
            id={`slash-menu-item-${index}`}
            type="button"
            role="option"
            aria-selected={index === selectedIndex}
            className={`zm-slash-menu-item ${
              index === selectedIndex ? 'selected' : ''
            }`}
            onClick={() => onSelect(item)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            {item.icon && (
              <span className="zm-slash-menu-item-icon" aria-hidden="true">{item.icon}</span>
            )}
            <div className="zm-slash-menu-item-content">
              <div className="zm-slash-menu-item-title">{item.title}</div>
              <div className="zm-slash-menu-item-description">
                {item.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }
);

SlashMenu.displayName = 'SlashMenu';

export default SlashMenu;
