'use client';

import { useState, useEffect } from 'react';
import ChatInput from '@/components/ChatInput';
import BlueprintView from '@/components/BlueprintView';
import FileTree from '@/components/FileTree';
import CodeViewer from '@/components/CodeViewer';
import PreviewPanel from '@/components/PreviewPanel';
import { Blueprint, GeneratedFile, StreamMessage } from '@/lib/schemas';
import { saveSession, loadSession } from '@/lib/storage';
import { Toaster, toast } from 'sonner';

type GenerationState = 'idle' | 'generating' | 'blueprint_ready' | 'files_streaming' | 'complete';

export default function Home() {
  const [state, setState] = useState<GenerationState>('idle');
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [currentPrompt, setCurrentPrompt] = useState<string>('');

  // Load session on mount
  useEffect(() => {
    const session = loadSession();
    if (session) {
      setBlueprint(session.blueprint || null);
      setFiles(session.files || []);
      setState('complete');
      toast.success('Previous session restored');
    }
  }, []);

  // Save session whenever state changes
  useEffect(() => {
    if (blueprint || files.length > 0) {
      saveSession({
        blueprint: blueprint || undefined,
        files,
        prompt: currentPrompt,
        timestamp: Date.now(),
      });
    }
  }, [blueprint, files, currentPrompt]);

  const handleGenerate = async (prompt: string) => {
    setCurrentPrompt(prompt);
    setState('generating');
    setBlueprint(null);
    setFiles([]);
    setSelectedFile(null);
    setStatusMessage('Starting generation...');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, intent: 'new' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Try to parse complete JSON objects from buffer
        while (buffer.length > 0) {
          // Skip whitespace
          buffer = buffer.trimStart();
          if (buffer.length === 0) break;

          // Try to find a complete JSON object
          let braceCount = 0;
          let inString = false;
          let escaped = false;
          let jsonEnd = -1;

          for (let i = 0; i < buffer.length; i++) {
            const char = buffer[i];

            if (escaped) {
              escaped = false;
              continue;
            }

            if (char === '\\') {
              escaped = true;
              continue;
            }

            if (char === '"') {
              inString = !inString;
              continue;
            }

            if (!inString) {
              if (char === '{') braceCount++;
              if (char === '}') braceCount--;

              if (braceCount === 0 && i > 0) {
                jsonEnd = i + 1;
                break;
              }
            }
          }

          // If we found a complete JSON object, parse it
          if (jsonEnd > 0) {
            const jsonStr = buffer.substring(0, jsonEnd);
            buffer = buffer.substring(jsonEnd);

            try {
              const message: StreamMessage = JSON.parse(jsonStr);

              switch (message.type) {
                case 'status':
                  setStatusMessage(message.message);
                  break;

                case 'blueprint':
                  setBlueprint(message.blueprint);
                  setState('blueprint_ready');
                  toast.success('Blueprint created!');
                  break;

                case 'file':
                  setFiles((prev) => {
                    const existing = prev.find((f) => f.path === message.file.path);
                    if (existing) {
                      return prev.map((f) =>
                        f.path === message.file.path ? message.file : f
                      );
                    }
                    return [...prev, message.file];
                  });
                  setState('files_streaming');
                  if (!selectedFile) {
                    setSelectedFile(message.file.path);
                  }
                  break;

                case 'file_update':
                  setFiles((prev) =>
                    prev.map((f) =>
                      f.path === message.file.path
                        ? { ...f, contents: message.file.contents || f.contents }
                        : f
                    )
                  );
                  break;

                case 'complete':
                  setState('complete');
                  setStatusMessage('');
                  toast.success(
                    `Generation complete! ${message.metrics?.files || 0} files created.`
                  );
                  break;

                case 'error':
                  toast.error(message.message);
                  if (message.details) {
                    console.error('Generation error:', message.details);
                  }
                  setState('idle');
                  break;
              }
            } catch (e) {
              console.error('Failed to parse JSON object:', jsonStr.substring(0, 100), e);
            }
          } else {
            // Incomplete JSON object, wait for more data
            break;
          }
        }
      }
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Failed to generate application');
      setState('idle');
    }
  };

  const handleReset = () => {
    setBlueprint(null);
    setFiles([]);
    setSelectedFile(null);
    setState('idle');
    setStatusMessage('');
    toast.info('Cleared current session');
  };

  const currentFile = files.find((f) => f.path === selectedFile);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Code Platform
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Describe your app, watch it come to life
              </p>
            </div>
            {state !== 'idle' && (
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Chat Input */}
        <div className="mb-8">
          <ChatInput
            onSubmit={handleGenerate}
            disabled={state === 'generating' || state === 'files_streaming'}
          />
          {statusMessage && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">{statusMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Blueprint */}
        {blueprint && (
          <div className="mb-8 animate-slide-up">
            <BlueprintView blueprint={blueprint} />
          </div>
        )}

        {/* Main Content Grid */}
        {files.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* File Tree */}
            <div className="lg:col-span-1">
              <FileTree
                files={files}
                selectedFile={selectedFile || undefined}
                onSelectFile={setSelectedFile}
              />
            </div>

            {/* Code Viewer & Preview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Code Viewer */}
              <div className="h-[500px]">
                <CodeViewer file={currentFile ? { path: currentFile.path, contents: currentFile.contents } : null} />
              </div>

              {/* Preview */}
              <div className="h-[600px]">
                <PreviewPanel files={files} />
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {state === 'idle' && files.length === 0 && !blueprint && (
          <div className="text-center py-20">
            <div className="inline-block p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
              <svg
                className="w-20 h-20 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to build something amazing?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Describe the application you want to create, and our AI will generate a complete,
              working prototype with live preview - all in seconds.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Instant Setup</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No configuration needed
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="text-3xl mb-2">👀</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Live Preview</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  See your app running instantly
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="text-3xl mb-2">🎨</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Beautiful UI</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Modern, responsive designs
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
