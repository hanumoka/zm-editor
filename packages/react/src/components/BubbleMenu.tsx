import { BubbleMenu as TiptapBubbleMenu, Editor } from '@tiptap/react';
import { useCallback } from 'react';

interface BubbleMenuProps {
  editor: Editor;
}

/**
 * BubbleMenu - 텍스트 선택 시 나타나는 서식 도구 메뉴
 */
export function BubbleMenu({ editor }: BubbleMenuProps) {
  const toggleBold = useCallback(() => {
    editor.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor.chain().focus().toggleItalic().run();
  }, [editor]);

  const toggleUnderline = useCallback(() => {
    editor.chain().focus().toggleUnderline().run();
  }, [editor]);

  const toggleStrike = useCallback(() => {
    editor.chain().focus().toggleStrike().run();
  }, [editor]);

  const toggleCode = useCallback(() => {
    editor.chain().focus().toggleCode().run();
  }, [editor]);

  const toggleHighlight = useCallback(() => {
    editor.chain().focus().toggleHighlight().run();
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  return (
    <TiptapBubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: 'top',
      }}
      className="zm-bubble-menu"
    >
      <button
        type="button"
        onClick={toggleBold}
        className={`zm-bubble-menu-button ${editor.isActive('bold') ? 'is-active' : ''}`}
        title="Bold"
      >
        <BoldIcon />
      </button>
      <button
        type="button"
        onClick={toggleItalic}
        className={`zm-bubble-menu-button ${editor.isActive('italic') ? 'is-active' : ''}`}
        title="Italic"
      >
        <ItalicIcon />
      </button>
      <button
        type="button"
        onClick={toggleUnderline}
        className={`zm-bubble-menu-button ${editor.isActive('underline') ? 'is-active' : ''}`}
        title="Underline"
      >
        <UnderlineIcon />
      </button>
      <button
        type="button"
        onClick={toggleStrike}
        className={`zm-bubble-menu-button ${editor.isActive('strike') ? 'is-active' : ''}`}
        title="Strikethrough"
      >
        <StrikeIcon />
      </button>
      <div className="zm-bubble-menu-divider" />
      <button
        type="button"
        onClick={toggleCode}
        className={`zm-bubble-menu-button ${editor.isActive('code') ? 'is-active' : ''}`}
        title="Code"
      >
        <CodeIcon />
      </button>
      <button
        type="button"
        onClick={toggleHighlight}
        className={`zm-bubble-menu-button ${editor.isActive('highlight') ? 'is-active' : ''}`}
        title="Highlight"
      >
        <HighlightIcon />
      </button>
      <button
        type="button"
        onClick={setLink}
        className={`zm-bubble-menu-button ${editor.isActive('link') ? 'is-active' : ''}`}
        title="Link"
      >
        <LinkIcon />
      </button>
    </TiptapBubbleMenu>
  );
}

// SVG Icons
function BoldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  );
}

function UnderlineIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
      <line x1="4" y1="21" x2="20" y2="21" />
    </svg>
  );
}

function StrikeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="12" x2="20" y2="12" />
      <path d="M17.5 7.5c0-2.5-2-4.5-5.5-4.5-3 0-5.5 1.5-5.5 4.5 0 6 11 6 11 11 0 2.5-2 4.5-5.5 4.5-3.5 0-5.5-2-5.5-4.5" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function HighlightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export default BubbleMenu;
