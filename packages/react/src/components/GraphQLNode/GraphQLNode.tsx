'use client';

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useCallback, useState, useRef, useEffect } from 'react';
import { useLocale } from '../../context';

export type GraphQLNodeProps = NodeViewProps;

/**
 * GraphQLNode - GraphQL 쿼리/응답 블록
 */
export function GraphQLNode({ node, updateAttributes, selected }: GraphQLNodeProps) {
  const locale = useLocale();
  const { endpoint = '', query = '', variables = '', response = '' } = node.attrs;

  const [isEditing, setIsEditing] = useState(false);
  const [endpointValue, setEndpointValue] = useState(endpoint);
  const [queryValue, setQueryValue] = useState(query);
  const [variablesValue, setVariablesValue] = useState(variables);
  const [responseValue, setResponseValue] = useState(response);
  const [activeTab, setActiveTab] = useState<'query' | 'variables' | 'response'>('query');
  const [copied, setCopied] = useState(false);
  const endpointInputRef = useRef<HTMLInputElement>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Initial edit mode
  useEffect(() => {
    if (!query) {
      setIsEditing(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync values
  useEffect(() => {
    setEndpointValue(endpoint);
    setQueryValue(query);
    setVariablesValue(variables);
    setResponseValue(response);
  }, [endpoint, query, variables, response]);

  // Focus on edit mode
  useEffect(() => {
    if (isEditing && endpointInputRef.current) {
      endpointInputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = useCallback(() => {
    updateAttributes({
      endpoint: endpointValue.trim(),
      query: queryValue.trim(),
      variables: variablesValue.trim(),
      response: responseValue.trim(),
    });
    if (queryValue.trim()) {
      setIsEditing(false);
    }
  }, [endpointValue, queryValue, variablesValue, responseValue, updateAttributes]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (query) {
          setEndpointValue(endpoint);
          setQueryValue(query);
          setVariablesValue(variables);
          setResponseValue(response);
          setIsEditing(false);
        }
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave, endpoint, query, variables, response]
  );

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCopy = useCallback(() => {
    let textToCopy = '';
    if (activeTab === 'query') {
      textToCopy = query;
    } else if (activeTab === 'variables') {
      textToCopy = variables;
    } else {
      textToCopy = response;
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }, [activeTab, query, variables, response]);

  // Edit mode
  if (isEditing || !query) {
    return (
      <NodeViewWrapper className="zm-graphql-wrapper">
        <div
          className={`zm-graphql zm-graphql-editing ${selected ? 'is-selected' : ''}`}
          data-drag-handle
        >
          <div className="zm-graphql-header">
            <GraphQLIcon />
            <span className="zm-graphql-label">GraphQL</span>
          </div>

          {/* Endpoint */}
          <div className="zm-graphql-endpoint-group">
            <input
              ref={endpointInputRef}
              type="text"
              className="zm-graphql-endpoint-input"
              value={endpointValue}
              onChange={(e) => setEndpointValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={locale.nodes?.graphql?.endpointPlaceholder || 'https://api.example.com/graphql'}
            />
          </div>

          {/* Tabs */}
          <div className="zm-graphql-tabs">
            <button
              type="button"
              className={`zm-graphql-tab ${activeTab === 'query' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('query')}
            >
              {locale.nodes?.graphql?.query || 'Query'}
            </button>
            <button
              type="button"
              className={`zm-graphql-tab ${activeTab === 'variables' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('variables')}
            >
              {locale.nodes?.graphql?.variables || 'Variables'}
            </button>
            <button
              type="button"
              className={`zm-graphql-tab ${activeTab === 'response' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('response')}
            >
              {locale.nodes?.graphql?.response || 'Response'}
            </button>
          </div>

          {/* Tab content */}
          <div className="zm-graphql-content">
            {activeTab === 'query' && (
              <textarea
                className="zm-graphql-textarea zm-graphql-query"
                value={queryValue}
                onChange={(e) => setQueryValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={locale.nodes?.graphql?.queryPlaceholder || 'query {\n  user(id: 1) {\n    name\n    email\n  }\n}'}
                rows={8}
              />
            )}
            {activeTab === 'variables' && (
              <textarea
                className="zm-graphql-textarea zm-graphql-variables"
                value={variablesValue}
                onChange={(e) => setVariablesValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={locale.nodes?.graphql?.variablesPlaceholder || '{\n  "id": 1\n}'}
                rows={4}
              />
            )}
            {activeTab === 'response' && (
              <textarea
                className="zm-graphql-textarea zm-graphql-response"
                value={responseValue}
                onChange={(e) => setResponseValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                placeholder={locale.nodes?.graphql?.responsePlaceholder || '{\n  "data": {\n    "user": {\n      "name": "John",\n      "email": "john@example.com"\n    }\n  }\n}'}
                rows={6}
              />
            )}
          </div>

          <div className="zm-graphql-hint">
            {locale.nodes?.graphql?.hint || 'Ctrl+Enter to confirm, Escape to cancel'}
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  // Display mode
  return (
    <NodeViewWrapper className="zm-graphql-wrapper">
      <div
        className={`zm-graphql zm-graphql-display ${selected ? 'is-selected' : ''}`}
        data-drag-handle
      >
        <div className="zm-graphql-header" onClick={handleEdit}>
          <GraphQLIcon />
          <span className="zm-graphql-label">GraphQL</span>
          {endpoint && <span className="zm-graphql-endpoint">{endpoint}</span>}
        </div>

        {/* Tabs */}
        <div className="zm-graphql-tabs">
          <button
            type="button"
            className={`zm-graphql-tab ${activeTab === 'query' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('query')}
          >
            {locale.nodes?.graphql?.query || 'Query'}
          </button>
          {variables && (
            <button
              type="button"
              className={`zm-graphql-tab ${activeTab === 'variables' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('variables')}
            >
              {locale.nodes?.graphql?.variables || 'Variables'}
            </button>
          )}
          {response && (
            <button
              type="button"
              className={`zm-graphql-tab ${activeTab === 'response' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('response')}
            >
              {locale.nodes?.graphql?.response || 'Response'}
            </button>
          )}
        </div>

        {/* Tab content */}
        <div className="zm-graphql-content" onClick={handleEdit}>
          {activeTab === 'query' && (
            <pre className="zm-graphql-code">{query}</pre>
          )}
          {activeTab === 'variables' && variables && (
            <pre className="zm-graphql-code">{variables}</pre>
          )}
          {activeTab === 'response' && response && (
            <pre className="zm-graphql-code">{response}</pre>
          )}
        </div>
      </div>

      {/* Toolbar on selection */}
      {selected && (
        <div className="zm-graphql-toolbar">
          <button
            type="button"
            className="zm-graphql-toolbar-btn"
            onClick={handleCopy}
            title={locale.nodes?.graphql?.copy || 'Copy'}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
          <button
            type="button"
            className="zm-graphql-toolbar-btn"
            onClick={handleEdit}
            title={locale.nodes?.graphql?.edit || 'Edit'}
          >
            <EditIcon />
          </button>
        </div>
      )}
    </NodeViewWrapper>
  );
}

function GraphQLIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 400 400" fill="currentColor">
      <path d="M57.468 302.66l-14.376-8.3 160.15-277.38 14.376 8.3z" fill="#E535AB"/>
      <path d="M39.8 272.2h320.3v16.6H39.8z" fill="#E535AB"/>
      <path d="M206.348 374.026l-160.21-92.5 8.3-14.376 160.21 92.5zM345.522 132.947l-160.21-92.5 8.3-14.376 160.21 92.5z" fill="#E535AB"/>
      <path d="M54.482 132.883l-8.3-14.375 160.21-92.5 8.3 14.375z" fill="#E535AB"/>
      <path d="M342.568 302.663l-160.15-277.38 14.376-8.3 160.15 277.38zM52.5 107.5h16.6v185H52.5zM330.9 107.5h16.6v185h-16.6z" fill="#E535AB"/>
      <path d="M203.522 367l-7.25-12.558 139.34-80.45 7.25 12.557z" fill="#E535AB"/>
      <path d="M369.5 297.9c-9.6 16.7-31 22.4-47.7 12.8-16.7-9.6-22.4-31-12.8-47.7 9.6-16.7 31-22.4 47.7-12.8 16.8 9.7 22.5 31 12.8 47.7M90.9 137c-9.6 16.7-31 22.4-47.7 12.8-16.7-9.6-22.4-31-12.8-47.7 9.6-16.7 31-22.4 47.7-12.8 16.7 9.7 22.4 31 12.8 47.7M30.5 297.9c-9.6-16.7-3.9-38 12.8-47.7 16.7-9.6 38-3.9 47.7 12.8 9.6 16.7 3.9 38-12.8 47.7-16.8 9.6-38.1 3.9-47.7-12.8M309.1 137c-9.6-16.7-3.9-38 12.8-47.7 16.7-9.6 38-3.9 47.7 12.8 9.6 16.7 3.9 38-12.8 47.7-16.7 9.6-38.1 3.9-47.7-12.8M200 395.8c-19.3 0-34.9-15.6-34.9-34.9 0-19.3 15.6-34.9 34.9-34.9 19.3 0 34.9 15.6 34.9 34.9 0 19.2-15.6 34.9-34.9 34.9M200 74c-19.3 0-34.9-15.6-34.9-34.9 0-19.3 15.6-34.9 34.9-34.9 19.3 0 34.9 15.6 34.9 34.9 0 19.3-15.6 34.9-34.9 34.9" fill="#E535AB"/>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export default GraphQLNode;
