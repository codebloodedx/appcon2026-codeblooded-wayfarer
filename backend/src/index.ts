import app from './app.js';
import dotenv from 'dotenv';
import { resolve } from 'node:path';

dotenv.config({ path: resolve(process.cwd(), '..', '.env') });

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`WayFarer API listening on http://localhost:${port}`);
});
