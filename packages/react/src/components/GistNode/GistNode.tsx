'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useLocale } from '../../context';

// Icons
const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export interface GistNodeProps extends NodeViewProps {}

interface GistInfo {
  id: string;
  owner: string;
  description: string;
  files: string[];
}

// Parse Gist URL
function parseGistUrl(url: string): { id: string; file?: string } | null {
  try {
    const trimmed = url.trim();

    // Handle gist.github.com URLs
    // https://gist.github.com/username/gistid
    // https://gist.github.com/username/gistid#file-filename
    const gistMatch = trimmed.match(/gist\.github\.com\/[\w-]+\/([a-f0-9]+)/i);
    if (gistMatch) {
      const fileMatch = trimmed.match(/#file-(.+)$/);
      return {
        id: gistMatch[1],
        file: fileMatch ? fileMatch[1].replace(/-/g, '.') : undefined,
      };
    }

    // Handle raw gist ID
    if (/^[a-f0-9]{20,}$/i.test(trimmed)) {
      return { id: trimmed };
    }

    return null;
  } catch {
    return null;
  }
}

export function GistNode({ node, updateAttributes, selected }: GistNodeProps) {
  const locale = useLocale();
  const t = locale.nodes.gist;

  const [isEditing, setIsEditing] = useState(!node.attrs.gistId);
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gistInfo, setGistInfo] = useState<GistInfo | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const gistId = node.attrs.gistId || '';
  const gistFile = node.attrs.gistFile || '';

  // Focus input when editing
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Fetch Gist info when gistId changes
  useEffect(() => {
    if (!gistId) return;

    const fetchGistInfo = async () => {
      try {
        const response = await fetch(`https://api.github.com/gists/${gistId}`);
        if (response.ok) {
          const data = await response.json();
          setGistInfo({
            id: data.id,
            owner: data.owner?.login || 'unknown',
            description: data.description || '',
            files: Object.keys(data.files || {}),
          });
        }
      } catch (err) {
        console.error('Failed to fetch gist info:', err);
      }
    };

    fetchGistInfo();
  }, [gistId]);

  // Handle URL submit
  const handleSubmit = useCallback(() => {
    const parsed = parseGistUrl(urlInput);
    if (!parsed) {
      setError(t.invalidUrl);
      return;
    }

    setLoading(true);
    setError(null);

    // Verify gist exists
    fetch(`https://api.github.com/gists/${parsed.id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Gist not found');
        }
        return response.json();
      })
      .then(() => {
        updateAttributes({
          gistId: parsed.id,
          gistFile: parsed.file || '',
        });
        setIsEditing(false);
        setUrlInput('');
      })
      .catch(() => {
        setError(t.notFound);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [urlInput, updateAttributes, t]);

  // Handle key down
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      if (gistId) {
        setIsEditing(false);
        setUrlInput('');
        setError(null);
      }
    }
  }, [handleSubmit, gistId]);

  // Generate embed URL
  const getEmbedUrl = useCallback(() => {
    let url = `https://gist.github.com/${gistId}.js`;
    if (gistFile) {
      url += `?file=${encodeURIComponent(gistFile)}`;
    }
    return url;
  }, [gistId, gistFile]);

  // Open in new tab
  const openInNewTab = useCallback(() => {
    const url = `https://gist.github.com/${gistId}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [gistId]);

  if (isEditing || !gistId) {
    return (
      <NodeViewWrapper className="zm-gist-wrapper">
        <div className="zm-gist editing" data-selected={selected}>
          <div className="zm-gist-input-container">
            <GithubIcon />
            <input
              ref={inputRef}
              type="text"
              className="zm-gist-url-input"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              disabled={loading}
            />
            <button
              type="button"
              className="zm-gist-submit-btn"
              onClick={handleSubmit}
              disabled={loading || !urlInput.trim()}
            >
              {loading ? '...' : t.embed}
            </button>
          </div>
          {error && <div className="zm-gist-error">{error}</div>}
          <div className="zm-gist-hint">{t.hint}</div>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="zm-gist-wrapper">
      <div className="zm-gist" data-selected={selected}>
        <div className="zm-gist-header" contentEditable={false}>
          <div className="zm-gist-info">
            <GithubIcon />
            <span className="zm-gist-label">
              {gistInfo ? `${gistInfo.owner} / ${gistInfo.files[0] || 'gist'}` : `Gist: ${gistId.slice(0, 8)}...`}
            </span>
          </div>
          <div className="zm-gist-actions">
            <button
              type="button"
              className="zm-gist-edit-btn"
              onClick={() => setIsEditing(true)}
              title={t.edit}
            >
              <EditIcon />
            </button>
            <button
              type="button"
              className="zm-gist-open-btn"
              onClick={openInNewTab}
              title={t.openInNewTab}
            >
              <ExternalLinkIcon />
            </button>
          </div>
        </div>
        <div className="zm-gist-embed" contentEditable={false}>
          <iframe
            ref={iframeRef}
            srcDoc={`
              <html>
                <head>
                  <base target="_blank">
                  <style>
                    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
                    .gist .gist-file { margin: 0 !important; border: none !important; }
                    .gist .gist-data { border: none !important; }
                    .gist .gist-meta { display: none !important; }
                  </style>
                </head>
                <body>
                  <script src="${getEmbedUrl()}"></script>
                </body>
              </html>
            `}
            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
            title={`GitHub Gist: ${gistId}`}
            loading="lazy"
          />
        </div>
      </div>
    </NodeViewWrapper>
  );
}

export default GistNode;
