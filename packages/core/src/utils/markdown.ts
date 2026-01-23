/**
 * 마크다운 변환 유틸리티
 *
 * HTML ↔ 마크다운 변환 기능 제공
 */

/**
 * HTML을 마크다운으로 변환
 *
 * @param html - 변환할 HTML 문자열
 * @returns 마크다운 문자열
 *
 * @example
 * ```ts
 * const html = editor.getHTML();
 * const markdown = htmlToMarkdown(html);
 * ```
 */
export function htmlToMarkdown(html: string): string {
  // 브라우저 환경 체크
  if (typeof document === 'undefined') {
    // Node.js 환경에서는 기본적인 regex 변환만 수행
    return htmlToMarkdownBasic(html);
  }

  const div = document.createElement('div');
  div.innerHTML = html;

  return processNode(div).trim().replace(/\n{3,}/g, '\n\n');
}

/**
 * DOM 노드를 마크다운으로 변환 (재귀)
 */
function processNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || '';
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  const children = Array.from(el.childNodes).map(processNode).join('');

  switch (tag) {
    // 제목
    case 'h1':
      return `# ${children}\n\n`;
    case 'h2':
      return `## ${children}\n\n`;
    case 'h3':
      return `### ${children}\n\n`;
    case 'h4':
      return `#### ${children}\n\n`;
    case 'h5':
      return `##### ${children}\n\n`;
    case 'h6':
      return `###### ${children}\n\n`;

    // 단락
    case 'p':
      return `${children}\n\n`;

    // 텍스트 서식
    case 'strong':
    case 'b':
      return `**${children}**`;
    case 'em':
    case 'i':
      return `*${children}*`;
    case 'u':
      return `<u>${children}</u>`;
    case 's':
    case 'strike':
    case 'del':
      return `~~${children}~~`;
    case 'mark':
      return `==${children}==`;

    // 코드
    case 'code':
      // pre 내부의 code는 부모에서 처리
      return el.parentElement?.tagName === 'PRE' ? children : `\`${children}\``;

    case 'pre': {
      const code = el.querySelector('code');
      const lang = code?.className.match(/language-(\w+)/)?.[1] || '';
      const text = code?.textContent || el.textContent || '';
      return `\n\`\`\`${lang}\n${text}\n\`\`\`\n\n`;
    }

    // 인용구
    case 'blockquote':
      return `> ${children.trim().replace(/\n/g, '\n> ')}\n\n`;

    // 목록
    case 'ul':
      return `${children}\n`;
    case 'ol':
      return `${children}\n`;
    case 'li': {
      const parent = el.parentElement;

      // 체크리스트 (TaskList)
      if (el.classList.contains('zm-task-item') || el.hasAttribute('data-checked')) {
        const checkbox = el.querySelector('input[type="checkbox"]');
        const isChecked = checkbox?.hasAttribute('checked') ||
          el.getAttribute('data-checked') === 'true';
        const checked = isChecked ? 'x' : ' ';
        return `- [${checked}] ${children.trim()}\n`;
      }

      // 순서 있는 목록
      if (parent?.tagName === 'OL') {
        const index = Array.from(parent.children).indexOf(el) + 1;
        return `${index}. ${children.trim()}\n`;
      }

      // 순서 없는 목록
      return `- ${children.trim()}\n`;
    }

    // 링크
    case 'a': {
      const href = el.getAttribute('href') || '';
      const title = el.getAttribute('title');
      if (title) {
        return `[${children}](${href} "${title}")`;
      }
      return `[${children}](${href})`;
    }

    // 이미지
    case 'img': {
      const src = el.getAttribute('src') || '';
      const alt = el.getAttribute('alt') || '';
      const title = el.getAttribute('title');
      if (title) {
        return `![${alt}](${src} "${title}")`;
      }
      return `![${alt}](${src})`;
    }

    // 구분선
    case 'hr':
      return `---\n\n`;

    // 줄바꿈
    case 'br':
      return '\n';

    // 테이블
    case 'table':
      return `\n${children}\n`;
    case 'thead':
    case 'tbody':
      return children;
    case 'tr': {
      const cells = Array.from(el.children).map((cell) => processNode(cell)).join(' | ');
      const isHeader = el.parentElement?.tagName === 'THEAD';
      if (isHeader) {
        const separator = Array.from(el.children).map(() => '---').join(' | ');
        return `| ${cells} |\n| ${separator} |\n`;
      }
      return `| ${cells} |\n`;
    }
    case 'th':
    case 'td':
      return children.trim();

    // 커스텀 노드: Callout
    case 'div': {
      // Callout 노드 감지
      if (el.classList.contains('zm-callout-node') || el.hasAttribute('data-callout-color')) {
        const color = el.getAttribute('data-callout-color') || 'info';
        const emoji = el.getAttribute('data-callout-emoji') || getDefaultCalloutEmoji(color);
        const content = children.trim();
        return `\n> ${emoji} **${capitalizeFirst(color)}**\n> ${content.replace(/\n/g, '\n> ')}\n\n`;
      }

      // Toggle 노드 감지
      if (el.classList.contains('zm-toggle-node') || el.hasAttribute('data-toggle-title')) {
        const title = el.getAttribute('data-toggle-title') || 'Toggle';
        const content = children.trim();
        return `\n<details>\n<summary>${title}</summary>\n\n${content}\n\n</details>\n\n`;
      }

      // Math 노드 감지
      if (el.classList.contains('zm-math-node') || el.hasAttribute('data-latex')) {
        const latex = el.getAttribute('data-latex') || children.trim();
        return `\n$$\n${latex}\n$$\n\n`;
      }

      // Embed 노드 감지
      if (el.classList.contains('zm-embed-node') || el.hasAttribute('data-embed-src')) {
        const src = el.getAttribute('data-embed-src') || '';
        return `\n[Embed: ${src}](${src})\n\n`;
      }

      // Bookmark 노드 감지
      if (el.classList.contains('zm-bookmark-node') || el.hasAttribute('data-bookmark-url')) {
        const url = el.getAttribute('data-bookmark-url') || '';
        const title = el.getAttribute('data-bookmark-title') || url;
        return `\n[${title}](${url})\n\n`;
      }

      // FileAttachment 노드 감지
      if (el.classList.contains('zm-file-attachment') || el.hasAttribute('data-file-url')) {
        const url = el.getAttribute('data-file-url') || '';
        const fileName = el.getAttribute('data-file-name') || 'File';
        return `\n[📎 ${fileName}](${url})\n\n`;
      }

      return children;
    }

    // span (label 내부 등)
    case 'span':
      return children;

    // label (TaskList의 checkbox label)
    case 'label':
      return '';

    // input (checkbox 등)
    case 'input':
      return '';

    default:
      return children;
  }
}

/**
 * Callout 색상별 기본 이모지
 */
function getDefaultCalloutEmoji(color: string): string {
  const emojiMap: Record<string, string> = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✅',
    tip: '💡',
    note: '📝',
  };
  return emojiMap[color] || '💬';
}

/**
 * 첫 글자 대문자
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Node.js 환경용 기본 HTML → 마크다운 변환 (regex 기반)
 */
function htmlToMarkdownBasic(html: string): string {
  return html
    // 제목
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
    // 단락
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    // 서식
    .replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gi, '**$2**')
    .replace(/<(em|i)[^>]*>(.*?)<\/\1>/gi, '*$2*')
    .replace(/<(s|strike|del)[^>]*>(.*?)<\/\1>/gi, '~~$2~~')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    // 링크
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    // 이미지
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
    .replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, '![$1]($2)')
    // 구분선
    .replace(/<hr\s*\/?>/gi, '---\n\n')
    // 줄바꿈
    .replace(/<br\s*\/?>/gi, '\n')
    // 나머지 태그 제거
    .replace(/<[^>]+>/g, '')
    // 연속 개행 정리
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * 마크다운을 HTML로 변환
 *
 * 주의: 이 함수는 기본적인 마크다운만 지원합니다.
 * 복잡한 마크다운 파싱이 필요한 경우 marked나 markdown-it 사용을 권장합니다.
 *
 * @param markdown - 변환할 마크다운 문자열
 * @returns HTML 문자열
 *
 * @example
 * ```ts
 * const markdown = '# Hello\n\nThis is **bold**';
 * const html = markdownToHtml(markdown);
 * editor.commands.setContent(html);
 * ```
 */
export function markdownToHtml(markdown: string): string {
  let html = markdown;

  // 코드블록 먼저 처리 (다른 변환이 적용되지 않도록)
  const codeBlocks: string[] = [];
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const index = codeBlocks.length;
    const escapedCode = escapeHtml(code.trim());
    codeBlocks.push(`<pre><code class="language-${lang || ''}">${escapedCode}</code></pre>`);
    return `__CODE_BLOCK_${index}__`;
  });

  // 인라인 코드 처리
  const inlineCodes: string[] = [];
  html = html.replace(/`([^`]+)`/g, (_, code) => {
    const index = inlineCodes.length;
    inlineCodes.push(`<code>${escapeHtml(code)}</code>`);
    return `__INLINE_CODE_${index}__`;
  });

  // 제목
  html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // 수평선
  html = html.replace(/^---$/gm, '<hr>');

  // 굵게/기울임/취소선
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // 링크
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // 이미지
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

  // 인용구
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  // 연속된 blockquote 병합
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n');

  // 체크리스트
  html = html.replace(/^- \[x\] (.+)$/gm, '<li class="zm-task-item" data-checked="true"><input type="checkbox" checked disabled>$1</li>');
  html = html.replace(/^- \[ \] (.+)$/gm, '<li class="zm-task-item" data-checked="false"><input type="checkbox" disabled>$1</li>');

  // 순서 없는 목록
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');

  // 순서 있는 목록
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // li 태그들을 ul/ol로 감싸기
  html = html.replace(/(<li class="zm-task-item"[^>]*>.*?<\/li>\n?)+/g, (match) => {
    return `<ul class="zm-task-list">${match}</ul>`;
  });
  html = html.replace(/(<li>.*?<\/li>\n?)+/g, (match) => {
    return `<ul>${match}</ul>`;
  });

  // 줄바꿈 → 단락
  html = html
    .split(/\n\n+/)
    .map((block) => {
      block = block.trim();
      if (!block) return '';
      // 이미 블록 요소인 경우 그대로 반환
      if (/^<(h[1-6]|ul|ol|blockquote|pre|hr|table|div)/.test(block)) {
        return block;
      }
      // 단락으로 감싸기
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    })
    .filter(Boolean)
    .join('\n');

  // 코드블록 복원
  codeBlocks.forEach((block, index) => {
    html = html.replace(`__CODE_BLOCK_${index}__`, block);
  });

  // 인라인 코드 복원
  inlineCodes.forEach((code, index) => {
    html = html.replace(`__INLINE_CODE_${index}__`, code);
  });

  return html;
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
