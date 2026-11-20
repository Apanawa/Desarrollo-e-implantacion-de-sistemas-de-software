import 'dotenv/config';
import { createApp } from './app';

const port = Number(process.env.PORT || 3006);
const app = createApp({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
});
const server = app.listen(port, '127.0.0.1', () => {
  console.info(`AdanGPT API: http://127.0.0.1:${port}`);
});
server.on('error', (error) => {
  console.error(`No se pudo iniciar AdanGPT: ${error.message}`);
  process.exitCode = 1;
});
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close();
    server.closeAllConnections();
  });
}
