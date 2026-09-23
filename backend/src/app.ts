import express from 'express';

export const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'roamright-api' });
});
