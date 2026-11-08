import { Buffer } from 'node:buffer';
import { defineConfig, loadEnv } from 'vite';
import { POST } from './api/contact.js';
import { validBaleConfig } from './lib/questionnaire-delivery.js';

function localContactApi() {
  return {
    name: 'local-contact-api',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (request.url?.split('?')[0] !== '/api/contact') return next();
        if (request.method !== 'POST') {
          response.statusCode = 405;
          response.setHeader('Allow', 'POST');
          response.end();
          return;
        }

        try {
          const chunks = [];
          let size = 0;
          for await (const chunk of request) {
            size += chunk.length;
            if (size > 2048) {
              response.statusCode = 413;
              response.setHeader('Content-Type', 'application/json');
              response.end(JSON.stringify({ ok: false, code: 'invalid_request' }));
              return;
            }
            chunks.push(chunk);
          }

          const headers = new Headers();
          for (const [name, value] of Object.entries(request.headers)) {
            if (typeof value === 'string') headers.set(name, value);
          }

          const host = request.headers.host || 'localhost';
          const apiRequest = new Request(new URL(request.url, `http://${host}`), {
            method: 'POST',
            headers,
            body: Buffer.concat(chunks).toString(),
          });
          const apiResponse = await POST(apiRequest);
          response.statusCode = apiResponse.status;
          apiResponse.headers.forEach((value, name) => response.setHeader(name, value));
          response.end(await apiResponse.text());
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

export default defineConfig(({ mode, command }) => {
  const baleNames = ['BALE_BOT_TOKEN', 'BALE_CHAT_ID', 'BALE_CHAT_ID2'];
  // Missing GitHub secrets are empty strings, which would mask .env.local.
  for (const name of baleNames.flatMap((name) => [name, `VITE_${name}`])) {
    if (process.env[name] !== undefined && !process.env[name].trim()) {
      delete process.env[name];
    }
  }
  const env = loadEnv(mode, process.cwd(), '');
  const [token, chatId, chatId2] = baleNames.map((name) => (
    env[`VITE_${name}`]?.trim() || env[name]?.trim() || ''
  ));
  if (command === 'build' && process.env.GITHUB_ACTIONS === 'true' &&
      !validBaleConfig({ token, chatIds: [chatId, chatId2] })) {
    throw new Error('Bale configuration is missing or invalid. Set BALE_BOT_TOKEN, BALE_CHAT_ID and BALE_CHAT_ID2 in GitHub Actions repository secrets. Chat IDs must be numeric and different.');
  }
  for (const name of baleNames) {
    if (!process.env[name] && env[name]) process.env[name] = env[name];
  }

  return {
    base: '/roxana/',
    build: {
      rollupOptions: {
        input: {
          main: 'index.html',
          assessment: 'assessment/index.html',
          questionnaire: 'questionnaire/index.html',
          faq: 'faq/index.html',
          about: 'about/index.html',
          contact: 'contact/index.html',
          privacy: 'privacy/index.html',
        },
      },
    },
    define: {
      'import.meta.env.VITE_BALE_BOT_TOKEN': JSON.stringify(token),
      'import.meta.env.VITE_BALE_CHAT_ID': JSON.stringify(chatId),
      'import.meta.env.VITE_BALE_CHAT_ID2': JSON.stringify(chatId2),
    },
    plugins: [localContactApi()],
  };
});
