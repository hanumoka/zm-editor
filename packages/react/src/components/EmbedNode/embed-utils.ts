/**
 * Embed URL 파싱 유틸리티
 */

export type EmbedType = 'youtube' | 'vimeo' | 'twitter' | 'codepen' | 'codesandbox' | 'stackblitz' | 'replit' | 'unknown';

export interface EmbedInfo {
  type: EmbedType;
  embedUrl: string | null;
  originalUrl: string;
  videoId?: string;
  aspectRatio?: string;
}

/**
 * YouTube URL 파싱
 * - youtube.com/watch?v=VIDEO_ID
 * - youtu.be/VIDEO_ID
 * - youtube.com/embed/VIDEO_ID
 */
function parseYouTube(url: string): EmbedInfo | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${match[1]}`,
        originalUrl: url,
        videoId: match[1],
        aspectRatio: '16/9',
      };
    }
  }
  return null;
}

/**
 * Vimeo URL 파싱
 * - vimeo.com/VIDEO_ID
 * - player.vimeo.com/video/VIDEO_ID
 */
function parseVimeo(url: string): EmbedInfo | null {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return {
        type: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${match[1]}`,
        originalUrl: url,
        videoId: match[1],
        aspectRatio: '16/9',
      };
    }
  }
  return null;
}

/**
 * Twitter/X URL 파싱
 * - twitter.com/USER/status/TWEET_ID
 * - x.com/USER/status/TWEET_ID
 */
function parseTwitter(url: string): EmbedInfo | null {
  const pattern = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/;
  const match = url.match(pattern);

  if (match && match[1]) {
    // Twitter는 oEmbed API 사용 필요, 여기서는 링크만 표시
    return {
      type: 'twitter',
      embedUrl: null, // Twitter는 iframe으로 직접 임베드 불가
      originalUrl: url,
      videoId: match[1],
    };
  }
  return null;
}

/**
 * CodePen URL 파싱
 * - codepen.io/USER/pen/PEN_ID
 */
function parseCodePen(url: string): EmbedInfo | null {
  const pattern = /codepen\.io\/([^/]+)\/pen\/([^/?]+)/;
  const match = url.match(pattern);

  if (match && match[1] && match[2]) {
    return {
      type: 'codepen',
      embedUrl: `https://codepen.io/${match[1]}/embed/${match[2]}?default-tab=result`,
      originalUrl: url,
      videoId: match[2],
      aspectRatio: '16/9',
    };
  }
  return null;
}

/**
 * CodeSandbox URL 파싱
 * - codesandbox.io/s/SANDBOX_ID
 * - codesandbox.io/p/sandbox/SANDBOX_ID
 */
function parseCodeSandbox(url: string): EmbedInfo | null {
  const patterns = [
    /codesandbox\.io\/s\/([^/?]+)/,
    /codesandbox\.io\/p\/sandbox\/([^/?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return {
        type: 'codesandbox',
        embedUrl: `https://codesandbox.io/embed/${match[1]}?fontsize=14&hidenavigation=1&theme=dark`,
        originalUrl: url,
        videoId: match[1],
        aspectRatio: '16/9',
      };
    }
  }
  return null;
}

/**
 * StackBlitz URL 파싱
 * - stackblitz.com/edit/PROJECT_ID
 * - stackblitz.com/github/USER/REPO
 * - stackblitz.com/fork/github/USER/REPO
 */
function parseStackBlitz(url: string): EmbedInfo | null {
  const patterns = [
    // stackblitz.com/edit/project-id
    /stackblitz\.com\/edit\/([^/?]+)/,
    // stackblitz.com/github/user/repo
    /stackblitz\.com\/github\/([^/?]+\/[^/?]+)/,
    // stackblitz.com/fork/github/user/repo
    /stackblitz\.com\/fork\/github\/([^/?]+\/[^/?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      // Determine embed URL based on pattern
      let embedUrl: string;
      if (url.includes('/github/') || url.includes('/fork/github/')) {
        embedUrl = `https://stackblitz.com/github/${match[1]}?embed=1&file=README.md`;
      } else {
        embedUrl = `https://stackblitz.com/edit/${match[1]}?embed=1&file=README.md`;
      }
      return {
        type: 'stackblitz',
        embedUrl,
        originalUrl: url,
        videoId: match[1],
        aspectRatio: '16/9',
      };
    }
  }
  return null;
}

/**
 * Replit URL 파싱
 * - replit.com/@USERNAME/PROJECT_NAME
 * - replit.com/@USERNAME/PROJECT_NAME#FILE_PATH
 */
function parseReplit(url: string): EmbedInfo | null {
  const pattern = /replit\.com\/@([^/]+)\/([^/?#]+)/;
  const match = url.match(pattern);

  if (match && match[1] && match[2]) {
    const user = match[1];
    const project = match[2];
    return {
      type: 'replit',
      embedUrl: `https://replit.com/@${user}/${project}?embed=true`,
      originalUrl: url,
      videoId: `${user}/${project}`,
      aspectRatio: '16/9',
    };
  }
  return null;
}

/**
 * URL을 분석하여 임베드 정보 반환
 */
export function parseEmbedUrl(url: string): EmbedInfo {
  // URL 정규화
  const normalizedUrl = url.trim();

  // 각 서비스별 파싱 시도
  const parsers = [
    parseYouTube,
    parseVimeo,
    parseTwitter,
    parseCodePen,
    parseCodeSandbox,
    parseStackBlitz,
    parseReplit,
  ];

  for (const parser of parsers) {
    const result = parser(normalizedUrl);
    if (result) {
      return result;
    }
  }

  // 알 수 없는 URL
  return {
    type: 'unknown',
    embedUrl: null,
    originalUrl: normalizedUrl,
  };
}

/**
 * 임베드 타입별 아이콘/라벨 반환
 */
export function getEmbedLabel(type: EmbedType): string {
  const labels: Record<EmbedType, string> = {
    youtube: 'YouTube',
    vimeo: 'Vimeo',
    twitter: 'Twitter',
    codepen: 'CodePen',
    codesandbox: 'CodeSandbox',
    stackblitz: 'StackBlitz',
    replit: 'Replit',
    unknown: 'Embed',
  };
  return labels[type];
}

/**
 * URL이 유효한 임베드 URL인지 확인
 */
export function isValidEmbedUrl(url: string): boolean {
  const info = parseEmbedUrl(url);
  return info.type !== 'unknown';
}
