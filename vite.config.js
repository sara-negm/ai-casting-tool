import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'local-anthropic-proxy',
        configureServer(server) {
          server.middlewares.use('/api/claude', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: { message: 'Method not allowed' } }));
              return;
            }

            const apiKey = env.ANTHROPIC_API_KEY;
            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: {
                    message:
                      'ANTHROPIC_API_KEY is not set in .env.local. Add it and restart the dev server.',
                  },
                })
              );
              return;
            }

            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            const body = Buffer.concat(chunks).toString();

            try {
              const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': apiKey,
                  'anthropic-version': '2023-06-01',
                },
                body,
              });
              const responseBody = await anthropicRes.text();
              res.statusCode = anthropicRes.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(responseBody);
            } catch (err) {
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: { message: err instanceof Error ? err.message : String(err) },
                })
              );
            }
          });
        },
      },
    ],
    server: { port: 8000 },
  };
});
