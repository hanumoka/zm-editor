'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

export interface EmojiCategory {
  name: string;
  icon: string;
  emojis: string[];
}

export interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
}

// Common emojis organized by category
const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: 'Smileys',
    icon: '😀',
    emojis: [
      '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
      '😉', '😍', '🥰', '😘', '😗', '😋', '😛', '😜', '🤪', '😎',
      '🤩', '🥳', '😏', '😒', '😔', '😢', '😭', '😤', '😠', '😡',
      '🤯', '😱', '😰', '😥', '🤔', '🤫', '🤭', '🙄', '😴', '🤮',
    ],
  },
  {
    name: 'Gestures',
    icon: '👍',
    emojis: [
      '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤝',
      '🙏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇',
      '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '💪', '🦾', '🦿', '👀',
    ],
  },
  {
    name: 'Objects',
    icon: '💻',
    emojis: [
      '💻', '🖥️', '🖨️', '⌨️', '🖱️', '💾', '💿', '📱', '📞', '☎️',
      '📷', '🎥', '📺', '🔌', '💡', '🔦', '📚', '📖', '📝', '✏️',
      '📎', '📌', '📍', '🔑', '🔒', '🔓', '🛠️', '🔧', '🔨', '⚙️',
    ],
  },
  {
    name: 'Symbols',
    icon: '✅',
    emojis: [
      '✅', '❌', '❓', '❗', '⚠️', '🚫', '💯', '🔴', '🟠', '🟡',
      '🟢', '🔵', '🟣', '⚫', '⚪', '🔶', '🔷', '🔸', '🔹', '💠',
      '⭐', '🌟', '✨', '💫', '💥', '💢', '💬', '💭', '🗯️', '💤',
      '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️',
    ],
  },
  {
    name: 'Nature',
    icon: '🌈',
    emojis: [
      '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌧️', '⛈️', '🌩️', '❄️',
      '🌸', '🌺', '🌻', '🌹', '🌷', '🌱', '🌲', '🌳', '🍀', '🍁',
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
    ],
  },
  {
    name: 'Food',
    icon: '🍕',
    emojis: [
      '🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥓', '🍳', '🧇', '🥞',
      '🍞', '🥐', '🥖', '🧀', '🥗', '🍜', '🍝', '🍣', '🍱', '🍲',
      '🍰', '🎂', '🧁', '🍩', '🍪', '🍫', '🍬', '🍭', '☕', '🍵',
    ],
  },
];

/**
 * EmojiPicker - 이모지 선택 컴포넌트
 */
export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleEmojiClick = useCallback(
    (emoji: string) => {
      onSelect(emoji);
    },
    [onSelect]
  );

  // Filter emojis by search
  const filteredEmojis = useMemo(() => {
    if (!search.trim()) {
      return EMOJI_CATEGORIES[activeCategory].emojis;
    }
    // When searching, show all matching emojis from all categories
    const allEmojis: string[] = [];
    EMOJI_CATEGORIES.forEach((cat) => {
      allEmojis.push(...cat.emojis);
    });
    return allEmojis.filter((emoji) => emoji.includes(search));
  }, [activeCategory, search]);

  return (
    <div className="zm-emoji-picker" ref={pickerRef}>
      {/* Search input */}
      <div className="zm-emoji-picker-search">
        <input
          type="text"
          placeholder="Search emoji..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="zm-emoji-picker-search-input"
          autoFocus
        />
      </div>

      {/* Category tabs */}
      {!search && (
        <div className="zm-emoji-picker-categories" role="tablist">
          {EMOJI_CATEGORIES.map((category, index) => (
            <button
              key={category.name}
              type="button"
              role="tab"
              aria-selected={activeCategory === index}
              className={`zm-emoji-picker-category-btn ${
                activeCategory === index ? 'is-active' : ''
              }`}
              onClick={() => setActiveCategory(index)}
              title={category.name}
            >
              {category.icon}
            </button>
          ))}
        </div>
      )}

      {/* Emoji grid */}
      <div className="zm-emoji-picker-grid">
        {filteredEmojis.length > 0 ? (
          filteredEmojis.map((emoji, index) => (
            <button
              key={`${emoji}-${index}`}
              type="button"
              className="zm-emoji-picker-emoji"
              onClick={() => handleEmojiClick(emoji)}
              title={emoji}
            >
              {emoji}
            </button>
          ))
        ) : (
          <div className="zm-emoji-picker-empty">No emoji found</div>
        )}
      </div>
    </div>
  );
}

export default EmojiPicker;
