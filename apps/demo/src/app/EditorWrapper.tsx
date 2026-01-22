'use client';

import { forwardRef } from 'react';
import { ZmEditor, type ZmEditorRef, type JSONContent, type ZmEditorLocale, type ImageUploadHandler, type FileUploadHandler } from '@zm-editor/react';

interface EditorWrapperProps {
  initialContent: JSONContent;
  onChange: (content: JSONContent) => void;
  locale: ZmEditorLocale;
  placeholder: string;
  onImageUpload?: ImageUploadHandler;
  onImageUploadError?: (error: Error, file: File) => void;
  onFileUpload?: FileUploadHandler;
  onFileUploadError?: (error: Error, file: File) => void;
}

const EditorWrapper = forwardRef<ZmEditorRef, EditorWrapperProps>(
  ({ initialContent, onChange, locale, placeholder, onImageUpload, onImageUploadError, onFileUpload, onFileUploadError }, ref) => {
    return (
      <ZmEditor
        ref={ref}
        initialContent={initialContent}
        onChange={onChange}
        locale={locale}
        placeholder={placeholder}
        enableSlashCommand={true}
        enableBubbleMenu={true}
        onImageUpload={onImageUpload}
        onImageUploadError={onImageUploadError}
        onFileUpload={onFileUpload}
        onFileUploadError={onFileUploadError}
      />
    );
  }
);

EditorWrapper.displayName = 'EditorWrapper';

export default EditorWrapper;
