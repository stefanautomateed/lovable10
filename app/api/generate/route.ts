import { streamOpenAI, streamToString } from '@/lib/openai';
import { StreamMessageSchema } from '@/lib/schemas';

export const runtime = 'edge';

const SYSTEM_PROMPT = `You are an expert web developer who creates complete, working React applications.

When given a user's request, you must respond in TWO PHASES:

PHASE 1 - BLUEPRINT:
Output a single JSON object with type "blueprint" containing:
{
  "type": "blueprint",
  "blueprint": {
    "title": "App Name",
    "description": "Brief description",
    "pages": ["Home", "About"],
    "components": ["Button", "Card"],
    "routes": ["/", "/about"],
    "tech": {"framework": "react", "ui": "css"},
    "notes": "Implementation notes"
  }
}

PHASE 2 - FILES:
Output multiple JSON objects, one per file, with type "file":
{
  "type": "file",
  "file": {
    "path": "App.js",
    "language": "javascript",
    "purpose": "main component",
    "contents": "file contents here..."
  }
}

REQUIREMENTS:
- Keep apps under 10 files
- Always include: App.js, index.js, styles.css, package.json
- Use React functional components with hooks
- Include inline comments explaining the code
- Make the UI beautiful and modern
- Use CSS for styling (inline styles or separate CSS file)
- Ensure all code is production-ready and error-free
- Do NOT use server-side code or API calls to external services
- Create complete, working applications that run in the browser

For package.json, include:
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "main": "/index.js"
}

Output ONLY valid JSON objects, one per line. No markdown, no explanations, no extra text.`;

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
        // Validate with zod
        StreamMessageSchema.parse(obj);
        const line = JSON.stringify(obj) + '\n';
        await writer.write(encoder.encode(line));
      } catch (error) {
        console.error('Schema validation failed:', error);
        // Still write it but log the error
        const line = JSON.stringify(obj) + '\n';
        await writer.write(encoder.encode(line));
      }
    };

    // Start streaming in the background
    (async () => {
      try {
        await write({ type: 'status', message: 'Connecting to AI...' });

        const userMessage = intent === 'refine' && targetFile
          ? `Modify the file "${targetFile}" based on this request: ${prompt}`
          : `Create a web application: ${prompt}`;

        const stream = await streamOpenAI({
          apiKey,
          model: modelToUse,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.7,
          maxTokens: 4000,
        });

        await write({ type: 'status', message: 'Generating blueprint and files...' });

        const fullResponse = await streamToString(stream);

        // Parse the response line by line
        const lines = fullResponse.split('\n').filter(line => line.trim());
        let fileCount = 0;

        for (const line of lines) {
          try {
            const obj = JSON.parse(line);

            if (obj.type === 'blueprint') {
              await write(obj);
              await write({ type: 'status', message: 'Blueprint ready. Generating files...' });
            } else if (obj.type === 'file') {
              fileCount++;
              await write(obj);
              await write({ type: 'status', message: `Generated file ${fileCount}: ${obj.file.path}` });
            }
          } catch (parseError) {
            // If it's not valid JSON, it might be partial output
            // Try to extract JSON objects from the text
            const jsonMatches = line.match(/\{[^}]+\}/g);
            if (jsonMatches) {
              for (const match of jsonMatches) {
                try {
                  const obj = JSON.parse(match);
                  if (obj.type === 'blueprint') {
                    await write(obj);
                  } else if (obj.type === 'file') {
                    fileCount++;
                    await write(obj);
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
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
