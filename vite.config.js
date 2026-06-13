import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function localApiPlugin() {
  const apiHandlers = {
    availability: () => import('./api/availability.js'),
    book: () => import('./api/book.js')
  };

  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use('/api', async (request, response, next) => {
        const requestUrl = new URL(request.url, 'http://localhost');
        const route = requestUrl.pathname.replace(/^\/+/, '');

        if (!apiHandlers[route]) {
          next();
          return;
        }

        try {
          request.query = Object.fromEntries(requestUrl.searchParams.entries());
          const module = await apiHandlers[route]();
          await module.default(request, response);
        } catch (error) {
          response.statusCode = 500;
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify({ error: error.message }));
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  for (const [key, value] of Object.entries(env)) {
    process.env[key] ||= value;
  }

  return {
    plugins: [react(), localApiPlugin()]
  };
});
