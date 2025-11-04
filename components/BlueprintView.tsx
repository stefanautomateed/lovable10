'use client';

import { Blueprint } from '@/lib/schemas';

interface BlueprintViewProps {
  blueprint: Blueprint;
}

export default function BlueprintView({ blueprint }: BlueprintViewProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 shadow-lg animate-fade-in">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-blue-600 rounded-lg">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {blueprint.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {blueprint.description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {blueprint.pages && blueprint.pages.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-purple-600">📄</span> Pages
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
              {blueprint.pages.map((page, i) => (
                <li key={i}>{page}</li>
              ))}
            </ul>
          </div>
        )}

        {blueprint.components && blueprint.components.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-blue-600">🧩</span> Components
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
              {blueprint.components.map((comp, i) => (
                <li key={i}>{comp}</li>
              ))}
            </ul>
          </div>
        )}

        {blueprint.routes && blueprint.routes.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-green-600">🛣️</span> Routes
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
              {blueprint.routes.map((route, i) => (
                <li key={i} className="font-mono">{route}</li>
              ))}
            </ul>
          </div>
        )}

        {blueprint.tech && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-orange-600">⚙️</span> Tech Stack
            </h3>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <p><strong>Framework:</strong> {blueprint.tech.framework}</p>
              {blueprint.tech.ui && <p><strong>UI:</strong> {blueprint.tech.ui}</p>}
              {blueprint.tech.styling && <p><strong>Styling:</strong> {blueprint.tech.styling}</p>}
            </div>
          </div>
        )}
      </div>

      {blueprint.notes && (
        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-900 dark:text-yellow-200">
            <strong>Notes:</strong> {blueprint.notes}
          </p>
        </div>
      )}
    </div>
  );
}
