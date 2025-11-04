'use client';

import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { getFileLanguage } from '@/lib/sandpackAdapter';

interface CodeViewerProps {
  file: {
    path: string;
    contents: string;
  } | null;
}

export default function CodeViewer({ file }: CodeViewerProps) {
  if (!file) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-full flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          <p className="text-lg font-medium">No file selected</p>
          <p className="text-sm mt-2">Select a file from the tree to view its contents</p>
        </div>
      </div>
    );
  }

  const language = getFileLanguage(file.path);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          <span className="text-white font-medium text-sm">{file.path}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-gray-600 text-gray-200 text-xs rounded">
            {language}
          </span>
          <span className="text-gray-400 text-xs">
            {file.contents.split('\n').length} lines
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage={language}
          language={language}
          value={file.contents}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  );
}
