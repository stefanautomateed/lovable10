import { streamOpenAI, streamToString, OpenAIMessage } from '@/lib/openai';
import { StreamMessageSchema } from '@/lib/schemas';

export const runtime = 'edge';

// Version: 1.0.3 - Streaming parser fix deployed
const VERSION = '1.0.3';

// Helper to extract JSON from text that might contain markdown or other formatting
function extractJSON(text: string): any {
  // Remove markdown code blocks
  let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');

  // Try to find JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON object found in response');
  }

  return JSON.parse(jsonMatch[0]);
}

// Helper to call OpenAI and get full response
async function callOpenAI(apiKey: string, model: string, messages: OpenAIMessage[]) {
  const stream = await streamOpenAI({
    apiKey,
    model,
    messages,
    temperature: 0.7,
    maxTokens: 4000,
  });
  return await streamToString(stream);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, intent = 'new', targetFile, model } = body;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const modelToUse = model || process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    const write = async (obj: unknown) => {
      try {
        StreamMessageSchema.parse(obj);
        const line = JSON.stringify(obj) + '\n';
        await writer.write(encoder.encode(line));
      } catch (error) {
        console.error('Schema validation failed:', error);
        const line = JSON.stringify(obj) + '\n';
        await writer.write(encoder.encode(line));
      }
    };

    // Start generation in background
    (async () => {
      try {
        await write({ type: 'status', message: 'Planning your application...' });

        // Step 1: Generate Blueprint
        const blueprintPrompt = `You are a web development architect. Create a detailed blueprint for this application: "${prompt}"

Return ONLY a JSON object in this exact format (no markdown, no extra text):
{
  "title": "App Name",
  "description": "Brief description of the app",
  "pages": ["Home", "About"],
  "components": ["Button", "Card", "Header"],
  "routes": ["/", "/about"],
  "tech": {
    "framework": "react",
    "ui": "modern CSS",
    "styling": "CSS3"
  },
  "notes": "Any important implementation notes"
}`;

        const blueprintResponse = await callOpenAI(apiKey, modelToUse, [
          { role: 'user', content: blueprintPrompt }
        ]);

        // Parse blueprint
        let blueprint = null;
        try {
          // Extract JSON from response (handles markdown code blocks)
          blueprint = extractJSON(blueprintResponse);
          await write({
            type: 'blueprint',
            blueprint: blueprint
          });
        } catch (e) {
          console.error('Failed to parse blueprint:', e, 'Response:', blueprintResponse.slice(0, 200));
          // Create a default blueprint
          blueprint = {
            title: prompt.slice(0, 50),
            description: `A custom ${prompt}`,
            pages: ["Home"],
            components: ["App"],
            routes: ["/"],
            tech: { framework: "react", ui: "CSS" }
          };
          await write({ type: 'blueprint', blueprint });
        }

        await write({ type: 'status', message: 'Generating application files...' });

        // Step 2: Generate Files
        const filesPrompt = `Create a complete React application for: "${prompt}"

Generate the following files for a working React app:

1. App.js - Main React component
2. index.js - Entry point with React DOM rendering
3. styles.css - Beautiful CSS styles
4. package.json - Dependencies

For EACH file, write it in this format:
FILE: filename.ext
\`\`\`
file contents here
\`\`\`

Requirements:
- Use React 18 functional components with hooks
- Make the UI beautiful and modern
- Include helpful comments
- Make it fully functional
- Use inline styles or CSS file for styling
- No external API calls
- Keep it simple but impressive

Start with FILE: App.js`;

        const filesResponse = await callOpenAI(apiKey, modelToUse, [
          { role: 'user', content: filesPrompt }
        ]);

        // Parse files from response - handle multiple formats
        let fileCount = 0;

        // Try multiple patterns to extract files
        const patterns = [
          /FILE:\s*([^\n]+)\n```(?:javascript|js|jsx|css|json|html)?\n?([\s\S]*?)```/gi,
          /FILE:\s*([^\n]+)\n```\n?([\s\S]*?)```/gi,
          /##?\s*([^\n]+\.(?:js|jsx|css|json|html))\n```(?:javascript|js|jsx|css|json|html)?\n?([\s\S]*?)```/gi,
        ];

        for (const pattern of patterns) {
          const matches = Array.from(filesResponse.matchAll(pattern));

          for (const match of matches) {
            const filepath = match[1];
            const contents = match[2];
            const path = filepath.trim();
            const fileContents = contents.trim();

            if (path && fileContents && !fileContents.includes('FILE:')) {
              fileCount++;

              const ext = path.split('.').pop()?.toLowerCase();
              const languageMap: Record<string, string> = {
                js: 'javascript',
                jsx: 'javascript',
                css: 'css',
                json: 'json',
                html: 'html'
              };

              await write({
                type: 'file',
                file: {
                  path,
                  language: languageMap[ext || 'js'] || 'javascript',
                  purpose: `Generated file`,
                  contents: fileContents
                }
              });

              await write({
                type: 'status',
                message: `Created ${path}`
              });
            }
          }

          // If we found files with this pattern, don't try others
          if (fileCount > 0) break;
        }

        // If no files were generated, create default files
        if (fileCount === 0) {
          await write({ type: 'status', message: 'Creating default application structure...' });

          // Create default files
          const defaultFiles = [
            {
              path: 'App.js',
              language: 'javascript',
              purpose: 'Main application component',
              contents: `import React, { useState } from 'react';
import './styles.css';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚀 ${prompt}</h1>
        <p>Your app is ready!</p>
      </header>

      <main className="app-main">
        <div className="card">
          <h2>Counter Example</h2>
          <p className="count">{count}</p>
          <div className="button-group">
            <button onClick={() => setCount(count - 1)}>-</button>
            <button onClick={() => setCount(0)}>Reset</button>
            <button onClick={() => setCount(count + 1)}>+</button>
          </div>
        </div>
      </main>
    </div>
  );
}`
            },
            {
              path: 'index.js',
              language: 'javascript',
              purpose: 'Application entry point',
              contents: `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(<App />);`
            },
            {
              path: 'styles.css',
              language: 'css',
              purpose: 'Application styles',
              contents: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.app-header p {
  color: #666;
  font-size: 1.2rem;
}

.app-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  min-width: 300px;
}

.card h2 {
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.count {
  font-size: 4rem;
  font-weight: bold;
  color: #667eea;
  margin: 1.5rem 0;
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

button {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  background: #667eea;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background: #764ba2;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

button:active {
  transform: translateY(0);
}`
            },
            {
              path: 'package.json',
              language: 'json',
              purpose: 'Project dependencies',
              contents: `{
  "name": "generated-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "main": "/index.js"
}`
            }
          ];

          for (const file of defaultFiles) {
            fileCount++;
            await write({
              type: 'file',
              file
            });
            await write({
              type: 'status',
              message: `Created ${file.path}`
            });
          }
        }

        await write({
          type: 'complete',
          metrics: { files: fileCount },
        });

      } catch (error) {
        console.error('Generation error:', error);
        await write({
          type: 'error',
          message: 'Failed to generate application',
          details: error instanceof Error ? error.message : String(error),
        });
      } finally {
        try {
          await writer.close();
        } catch {
          // Writer might already be closed
        }
      }
    })();

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Request error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
