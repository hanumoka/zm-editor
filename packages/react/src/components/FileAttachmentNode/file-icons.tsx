import React from 'react';

/**
 * 파일 타입별 아이콘 반환
 */
export function getFileIcon(mimeType: string, fileName?: string): React.ReactNode {
  // 확장자로 타입 추론 (mimeType이 없을 경우)
  const ext = fileName?.split('.').pop()?.toLowerCase() || '';

  // PDF
  if (mimeType === 'application/pdf' || ext === 'pdf') {
    return <PdfIcon />;
  }

  // Word 문서
  if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === 'doc' ||
    ext === 'docx'
  ) {
    return <WordIcon />;
  }

  // Excel 스프레드시트
  if (
    mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    ext === 'xls' ||
    ext === 'xlsx'
  ) {
    return <ExcelIcon />;
  }

  // PowerPoint 프레젠테이션
  if (
    mimeType === 'application/vnd.ms-powerpoint' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    ext === 'ppt' ||
    ext === 'pptx'
  ) {
    return <PowerPointIcon />;
  }

  // 압축 파일
  if (
    mimeType === 'application/zip' ||
    mimeType === 'application/x-rar-compressed' ||
    mimeType === 'application/x-7z-compressed' ||
    mimeType === 'application/gzip' ||
    ['zip', 'rar', '7z', 'gz', 'tar'].includes(ext)
  ) {
    return <ArchiveIcon />;
  }

  // 텍스트/코드 파일
  if (
    mimeType?.startsWith('text/') ||
    ['txt', 'md', 'json', 'xml', 'csv', 'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'py', 'java', 'c', 'cpp', 'h'].includes(ext)
  ) {
    return <TextIcon />;
  }

  // 이미지 파일
  if (mimeType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext)) {
    return <ImageIcon />;
  }

  // 비디오 파일
  if (mimeType?.startsWith('video/') || ['mp4', 'webm', 'avi', 'mov', 'mkv', 'wmv'].includes(ext)) {
    return <VideoIcon />;
  }

  // 오디오 파일
  if (mimeType?.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(ext)) {
    return <AudioIcon />;
  }

  // 기본 파일 아이콘
  return <FileIcon />;
}

/**
 * 파일 크기를 사람이 읽기 쉬운 형식으로 변환
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
}

// Icon Components
function FileIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="13,2 13,9 20,9" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="#e53e3e" />
      <polyline points="13,2 13,9 20,9" stroke="#e53e3e" />
      <text x="12" y="17" fontSize="6" fill="#e53e3e" textAnchor="middle" fontWeight="bold">PDF</text>
    </svg>
  );
}

function WordIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="#2b579a" />
      <polyline points="13,2 13,9 20,9" stroke="#2b579a" />
      <text x="12" y="17" fontSize="5" fill="#2b579a" textAnchor="middle" fontWeight="bold">DOC</text>
    </svg>
  );
}

function ExcelIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="#217346" />
      <polyline points="13,2 13,9 20,9" stroke="#217346" />
      <text x="12" y="17" fontSize="5" fill="#217346" textAnchor="middle" fontWeight="bold">XLS</text>
    </svg>
  );
}

function PowerPointIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="#d24726" />
      <polyline points="13,2 13,9 20,9" stroke="#d24726" />
      <text x="12" y="17" fontSize="5" fill="#d24726" textAnchor="middle" fontWeight="bold">PPT</text>
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="13,2 13,9 20,9" />
      <line x1="10" y1="12" x2="10" y2="18" />
      <line x1="14" y1="12" x2="14" y2="18" />
      <line x1="10" y1="15" x2="14" y2="15" />
    </svg>
  );
}

function TextIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="13,2 13,9 20,9" />
      <line x1="7" y1="13" x2="17" y2="13" />
      <line x1="7" y1="17" x2="14" y2="17" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21,15 16,10 5,21" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  );
}

function AudioIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

// Download Icon export for component use
export function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
