import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react';
import { useCallback, useState, useRef, useEffect } from 'react';
import type { CalloutColor } from './callout-extension';

export type CalloutNodeProps = NodeViewProps;

// 사용 가능한 이모지 목록
const EMOJI_OPTIONS = [
  '💡', '📌', '⚠️', '❗', '❓', '✅', '❌', '🔥',
  '⭐', '💪', '🎯', '📝', '💬', '🔔', '📢', '🚀',
  '💻', '🔧', '📦', '🎨', '🔒', '🔑', '📊', '📈',
];

// 색상 옵션
const COLOR_OPTIONS: { value: CalloutColor; label: string; bg: string; border: string }[] = [
  { value: 'gray', label: 'Gray', bg: '#f3f4f6', border: '#d1d5db' },
  { value: 'blue', label: 'Blue', bg: '#dbeafe', border: '#93c5fd' },
  { value: 'green', label: 'Green', bg: '#dcfce7', border: '#86efac' },
  { value: 'yellow', label: 'Yellow', bg: '#fef9c3', border: '#fde047' },
  { value: 'red', label: 'Red', bg: '#fee2e2', border: '#fca5a5' },
  { value: 'purple', label: 'Purple', bg: '#f3e8ff', border: '#d8b4fe' },
];

/**
 * CalloutNode - Notion-like 강조 박스 NodeView
 */
export function CalloutNode({ node, updateAttributes, selected }: CalloutNodeProps) {
  const { emoji = '💡', color = 'gray' } = node.attrs;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // 색상 정보 가져오기
  const colorInfo = COLOR_OPTIONS.find((c) => c.value === color) || COLOR_OPTIONS[0];

  // 이모지 변경
  const handleEmojiChange = useCallback(
    (newEmoji: string) => {
      updateAttributes({ emoji: newEmoji });
      setShowEmojiPicker(false);
    },
    [updateAttributes]
  );

  // 색상 변경
  const handleColorChange = useCallback(
    (newColor: CalloutColor) => {
      updateAttributes({ color: newColor });
      setShowColorPicker(false);
    },
    [updateAttributes]
  );

  // 외부 클릭 시 picker 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <NodeViewWrapper className="zm-callout-node-wrapper">
      <div
        className={`zm-callout-node ${selected ? 'is-selected' : ''}`}
        style={{
          backgroundColor: colorInfo.bg,
          borderColor: colorInfo.border,
        }}
        data-color={color}
      >
        {/* 이모지 버튼 */}
        <div className="zm-callout-emoji-container" ref={emojiPickerRef}>
          <button
            type="button"
            className="zm-callout-emoji-btn"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Change icon"
          >
            {emoji}
          </button>

          {/* 이모지 선택기 */}
          {showEmojiPicker && (
            <div className="zm-callout-emoji-picker">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className={`zm-callout-emoji-option ${e === emoji ? 'is-selected' : ''}`}
                  onClick={() => handleEmojiChange(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 콘텐츠 영역 */}
        <div className="zm-callout-content">
          <NodeViewContent className="zm-callout-content-inner" />
        </div>

        {/* 선택 시 색상 변경 버튼 */}
        {selected && (
          <div className="zm-callout-toolbar" ref={colorPickerRef}>
            <button
              type="button"
              className="zm-callout-color-btn"
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Change color"
            >
              <ColorIcon />
            </button>

            {/* 색상 선택기 */}
            {showColorPicker && (
              <div className="zm-callout-color-picker">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`zm-callout-color-option ${c.value === color ? 'is-selected' : ''}`}
                    style={{ backgroundColor: c.bg, borderColor: c.border }}
                    onClick={() => handleColorChange(c.value)}
                    title={c.label}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

// Icons
function ColorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 1 0 20" fill="currentColor" />
    </svg>
  );
}

export default CalloutNode;
