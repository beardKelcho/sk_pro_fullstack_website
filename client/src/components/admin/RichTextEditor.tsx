/**
 * Rich Text Editor Component
 * React Quill tabanlı zengin metin editörü
 * Yorum sistemi için kullanılır
 */

'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// React Quill'i dynamic import ile yükle (SSR sorunlarını önlemek için)
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Yorum yaz…',
  className = '',
  disabled = false,
}) => {
  // Quill modül konfigürasyonu
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ color: [] }, { background: [] }],
        ['link'],
        ['clean'],
      ],
    }),
    []
  );

  // Quill format seçenekleri
  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'color',
    'background',
    'link',
  ];

  return (
    <div className={`rich-text-editor ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={disabled}
        className="bg-white dark:bg-gray-900"
      />
      <style jsx global>{`
        .rich-text-editor .quill {
          background: white;
        }
        .dark .rich-text-editor .quill {
          background: #1f2937;
        }
        .rich-text-editor .ql-container {
          font-size: 14px;
          min-height: 120px;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          border-color: #d1d5db;
        }
        .dark .rich-text-editor .ql-container {
          border-color: #374151;
          background: #1f2937;
          color: white;
        }
        .rich-text-editor .ql-editor {
          min-height: 120px;
          color: #111827;
        }
        .dark .rich-text-editor .ql-editor {
          color: #f9fafb;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        .dark .rich-text-editor .ql-editor.ql-blank::before {
          color: #6b7280;
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border-color: #d1d5db;
          background: #f9fafb;
        }
        .dark .rich-text-editor .ql-toolbar {
          border-color: #374151;
          background: #111827;
        }
        .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: #374151;
        }
        .dark .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: #9ca3af;
        }
        .rich-text-editor .ql-toolbar .ql-fill {
          fill: #374151;
        }
        .dark .rich-text-editor .ql-toolbar .ql-fill {
          fill: #9ca3af;
        }
        .rich-text-editor .ql-toolbar button:hover,
        .rich-text-editor .ql-toolbar button.ql-active {
          color: #0066cc;
        }
        .dark .rich-text-editor .ql-toolbar button:hover,
        .dark .rich-text-editor .ql-toolbar button.ql-active {
          color: #60a5fa;
        }
        .rich-text-editor .ql-toolbar .ql-picker-label {
          color: #374151;
        }
        .dark .rich-text-editor .ql-toolbar .ql-picker-label {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
