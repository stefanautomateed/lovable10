'use client';

import { GeneratedFile } from '@/lib/schemas';

interface FileTreeProps {
  files: GeneratedFile[];
  selectedFile?: string;
  onSelectFile: (path: string) => void;
}

export default function FileTree({ files, selectedFile, onSelectFile }: FileTreeProps) {
  const getFileIcon = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    const icons: Record<string, string> = {
      js: '📜',
      jsx: '⚛️',
      ts: '📘',
      tsx: '⚛️',
      css: '🎨',
      html: '🌐',
      json: '📋',
      md: '📝',
    };
    return icons[ext || ''] || '📄';
  };

  const sortedFiles = [...files].sort((a, b) => {
    // Sort by directory depth, then alphabetically
    const aDepth = (a.path.match(/\//g) || []).length;
    const bDepth = (b.path.match(/\//g) || []).length;
    if (aDepth !== bDepth) return aDepth - bDepth;
    return a.path.localeCompare(b.path);
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          Files ({files.length})
        </h3>
      </div>
      <div className="overflow-y-auto max-h-[600px]">
        {sortedFiles.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p>No files yet</p>
            <p className="text-sm mt-2">Files will appear here as they are generated</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedFiles.map((file) => (
              <li key={file.path}>
                <button
                  onClick={() => onSelectFile(file.path)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700
                             transition-colors flex items-center gap-2 group
                             ${selectedFile === file.path
                               ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600'
                               : ''
                             }`}
                >
                  <span className="text-xl">{getFileIcon(file.path)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      selectedFile === file.path
                        ? 'text-blue-700 dark:text-blue-400'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {file.path}
                    </p>
                    {file.purpose && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {file.purpose}
                      </p>
                    )}
                  </div>
                  {selectedFile === file.path && (
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
