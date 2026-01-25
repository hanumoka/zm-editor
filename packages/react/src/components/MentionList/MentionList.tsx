'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

export interface MentionItem {
  id: string;
  label: string;
  avatar?: string;
  description?: string;
}

export interface MentionListProps {
  items: MentionItem[];
  command: (item: MentionItem) => void;
}

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

/**
 * MentionList - @ 멘션 제안 목록 컴포넌트
 */
export const MentionList = forwardRef<MentionListRef, MentionListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // items가 변경되면 선택 인덱스 초기화
    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    // 키보드 네비게이션
    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
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
            command(item);
          }
          return true;
        }

        return false;
      },
    }));

    const selectItem = (index: number) => {
      const item = items[index];
      if (item) {
        command(item);
      }
    };

    if (items.length === 0) {
      return (
        <div className="zm-mention-list zm-mention-list-empty" role="listbox" aria-label="No users found">
          No users found
        </div>
      );
    }

    const selectedItemId = items[selectedIndex] ? `mention-item-${items[selectedIndex].id}` : undefined;

    return (
      <div
        className="zm-mention-list"
        role="listbox"
        aria-label="Mention suggestions"
        aria-activedescendant={selectedItemId}
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            id={`mention-item-${item.id}`}
            type="button"
            role="option"
            aria-selected={index === selectedIndex}
            className={`zm-mention-list-item ${
              index === selectedIndex ? 'selected' : ''
            }`}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            {item.avatar ? (
              <img
                src={item.avatar}
                alt=""
                aria-hidden="true"
                className="zm-mention-list-avatar"
              />
            ) : (
              <div className="zm-mention-list-avatar-placeholder" aria-hidden="true">
                {item.label.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="zm-mention-list-content">
              <div className="zm-mention-list-label">{item.label}</div>
              {item.description && (
                <div className="zm-mention-list-description">
                  {item.description}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    );
  }
);

MentionList.displayName = 'MentionList';

export default MentionList;
