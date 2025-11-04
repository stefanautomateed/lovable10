import { SandpackFiles } from '@codesandbox/sandpack-react';
import { GeneratedFile } from './schemas';

const DEFAULT_PACKAGE_JSON = {
  dependencies: {
    react: '^18.2.0',
    'react-dom': '^18.2.0',
    'react-scripts': '^5.0.1',
  },
  main: '/index.js',
};

const DEFAULT_INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated App</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;

const DEFAULT_INDEX_JS = `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

const root = createRoot(document.getElementById('root'));
root.render(<App />);`;

const DEFAULT_APP_JS = `import React from 'react';

export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>Welcome to your app!</h1>
      <p>Your generated application will appear here.</p>
    </div>
  );
}`;

const DEFAULT_STYLES_CSS = `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`;

export function filesToSandpack(files: GeneratedFile[]): SandpackFiles {
  const sandpackFiles: SandpackFiles = {};

  // Add generated files
  for (const file of files) {
    sandpackFiles[`/${file.path}`] = {
      code: file.contents,
    };
  }

  // Ensure required files exist with defaults
  if (!sandpackFiles['/index.html']) {
    sandpackFiles['/index.html'] = { code: DEFAULT_INDEX_HTML };
  }

  if (!sandpackFiles['/index.js'] && !sandpackFiles['/src/index.js']) {
    sandpackFiles['/index.js'] = { code: DEFAULT_INDEX_JS };
  }

  if (!sandpackFiles['/App.js'] && !sandpackFiles['/src/App.js']) {
    sandpackFiles['/App.js'] = { code: DEFAULT_APP_JS };
  }

  if (!sandpackFiles['/styles.css'] && !sandpackFiles['/src/styles.css']) {
    sandpackFiles['/styles.css'] = { code: DEFAULT_STYLES_CSS };
  }

  if (!sandpackFiles['/package.json']) {
    sandpackFiles['/package.json'] = {
      code: JSON.stringify(DEFAULT_PACKAGE_JSON, null, 2),
    };
  }

  return sandpackFiles;
}

export function normalizeFilePath(path: string): string {
  // Ensure path starts with /
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  return path;
}

export function getFileLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    css: 'css',
    html: 'html',
    json: 'json',
    md: 'markdown',
  };
  return languageMap[ext || ''] || 'javascript';
}
