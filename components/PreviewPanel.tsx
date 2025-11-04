'use client';

import { SandpackProvider, SandpackPreview, SandpackConsole } from '@codesandbox/sandpack-react';
import { GeneratedFile } from '@/lib/schemas';
import { filesToSandpack } from '@/lib/sandpackAdapter';
import { useState } from 'react';

interface PreviewPanelProps {
  files: GeneratedFile[];
}

export default function PreviewPanel({ files }: PreviewPanelProps) {
  const [showConsole, setShowConsole] = useState(false);

  if (files.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-full flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400 p-8">
          <svg
            className="w-20 h-20 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <p className="text-lg font-medium">No preview available</p>
          <p className="text-sm mt-2">The live preview will appear here once files are generated</p>
        </div>
      </div>
    );
  }

  const sandpackFiles = filesToSandpack(files);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
      <div className="bg-gradient-to-r from-green-600 to-teal-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span className="text-white font-semibold">Live Preview</span>
        </div>
        <button
          onClick={() => setShowConsole(!showConsole)}
          className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-sm rounded transition-colors"
        >
          {showConsole ? 'Hide Console' : 'Show Console'}
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <SandpackProvider
          template="react"
          files={sandpackFiles}
          theme="dark"
          options={{
            externalResources: ['https://cdn.tailwindcss.com'],
          }}
        >
          <div className="h-full flex flex-col">
            <div className={showConsole ? 'h-2/3' : 'h-full'}>
              <SandpackPreview
                showNavigator={true}
                showRefreshButton={true}
                showOpenInCodeSandbox={false}
                style={{ height: '100%' }}
              />
            </div>
            {showConsole && (
              <div className="h-1/3 border-t border-gray-700">
                <SandpackConsole
                  style={{ height: '100%' }}
                  showHeader={true}
                  resetOnPreviewRestart={true}
                />
              </div>
            )}
          </div>
        </SandpackProvider>
      </div>
    </div>
  );
}
