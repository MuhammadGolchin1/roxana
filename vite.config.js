import { Buffer } from 'node:buffer';
import { defineConfig, loadEnv } from 'vite';
import { POST } from './api/contact.js';

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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  for (const name of ['BALE_BOT_TOKEN', 'BALE_CHAT_ID', 'BALE_CHAT_ID2']) {
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
      'import.meta.env.VITE_BALE_BOT_TOKEN': JSON.stringify(env.VITE_BALE_BOT_TOKEN || env.BALE_BOT_TOKEN || ''),
      'import.meta.env.VITE_BALE_CHAT_ID': JSON.stringify(env.VITE_BALE_CHAT_ID || env.BALE_CHAT_ID || ''),
      'import.meta.env.VITE_BALE_CHAT_ID2': JSON.stringify(env.VITE_BALE_CHAT_ID2 || env.BALE_CHAT_ID2 || ''),
    },
    plugins: [localContactApi()],
  };
});
