import express, { type NextFunction, type Request, type Response } from 'express';
import { BriefingRepository } from './briefings.js';
import { GroqGuidanceModel, type GuidanceModel } from './groq.js';
import { parseImageDataUrl } from './image.js';
import { RuleRepository } from './rules.js';
import { isCountryCode } from './types.js';

type AppDependencies = { rules?: RuleRepository; briefings?: BriefingRepository; model?: GuidanceModel };

export function createApp(dependencies: AppDependencies = {}) {
  const app = express();
  const rules = dependencies.rules || new RuleRepository();
  const briefings = dependencies.briefings || new BriefingRepository();
  const model = dependencies.model || new GroqGuidanceModel();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok', service: 'wayfarer-api' });
  });

  app.get('/api/rules', async (request, response, next) => {
    try {
      const countryCode = request.query.countryCode;
      if (!isCountryCode(countryCode)) return response.status(400).json({ error: 'countryCode must be JP or PH' });
      return response.json(await rules.byCountry(countryCode));
    } catch (error) {
      return next(error);
    }
  });

  app.get('/api/briefing', async (request, response, next) => {
    try {
      const countryCode = request.query.countryCode;
      const locality = request.query.locality;
      if (!isCountryCode(countryCode)) return response.status(400).json({ error: 'countryCode must be JP or PH' });
      if (locality !== undefined && (typeof locality !== 'string' || locality.trim().length > 100)) {
        return response.status(400).json({ error: 'locality must be 100 characters or fewer' });
      }
      const items = await briefings.testedForTrip(countryCode, locality?.trim());
      if (items.length === 0) {
        return response.json({ status: 'unavailable', countryCode, locality: locality?.trim() || null, items: [], speechText: null });
      }
      const speechText = `Before you drive in ${locality?.trim() || countryCode}, here are ${items.length} important reminders. ${items.map((item) => item.spokenText).join(' ')}`;
      response.setHeader('Cache-Control', 'private, max-age=3600');
      return response.json({ status: 'ready', countryCode, locality: locality?.trim() || null, items, speechText });
    } catch (error) {
      return next(error);
    }
  });

  app.post('/api/recognize', async (request, response, next) => {
    try {
      const { countryCode, imageDataUrl } = request.body as Record<string, unknown>;
      if (!isCountryCode(countryCode)) return response.status(400).json({ error: 'countryCode must be JP or PH' });
      const image = parseImageDataUrl(imageDataUrl);
      if (!image) return response.status(400).json({ error: 'A JPEG, PNG, or WebP image up to 1.5 MB is required' });
      const allowedRules = await rules.byCountry(countryCode);
      const signId = await model.recognize(image, countryCode, allowedRules);
      const rule = signId ? allowedRules.find((item) => item.id === signId) : undefined;
      if (!rule) return response.json({ status: 'unknown', signId: null, rule: null });
      if (rule.status !== 'tested') return response.json({ status: 'candidate', signId: rule.id, rule });
      return response.json({ status: 'recognized', signId: rule.id, rule });
    } catch (error) {
      return next(error);
    }
  });

  app.post('/api/explain', async (request, response, next) => {
    try {
      const { countryCode, signId, question } = request.body as Record<string, unknown>;
      if (!isCountryCode(countryCode) || typeof signId !== 'string' || typeof question !== 'string') {
        return response.status(400).json({ error: 'countryCode, signId, and question are required' });
      }
      if (question.trim().length < 1 || question.length > 300) {
        return response.status(400).json({ error: 'question must contain 1 to 300 characters' });
      }
      const rule = await rules.findTested(countryCode, signId);
      if (!rule) return response.status(404).json({ error: 'No tested reviewed rule matches this country and sign' });
      const answer = await model.explain(rule, question.trim());
      return response.json({ answer, sourceUrl: rule.sourceUrl });
    } catch (error) {
      return next(error);
    }
  });

  app.post('/api/speak', async (request, response, next) => {
    try {
      const { countryCode, signId } = request.body as Record<string, unknown>;
      if (!isCountryCode(countryCode) || typeof signId !== 'string') {
        return response.status(400).json({ error: 'countryCode and signId are required' });
      }
      const rule = await rules.findTested(countryCode, signId);
      if (!rule) return response.status(404).json({ error: 'No tested reviewed rule matches this country and sign' });
      response.setHeader('Cache-Control', 'private, max-age=3600');
      return response.json({ text: rule.shortAlert, engine: 'browser-speech-synthesis' });
    } catch (error) {
      return next(error);
    }
  });

  app.use((error: Error, _request: Request, response: Response, _next: NextFunction) => {
    const requestError = error as Error & { status?: number; type?: string };
    if (requestError.type === 'entity.too.large' || requestError.status === 413) {
      return response.status(413).json({ error: 'Request body must be 2 MB or smaller' });
    }
    if (requestError instanceof SyntaxError && requestError.status === 400) {
      return response.status(400).json({ error: 'Request body must be valid JSON' });
    }
    if (error.message === 'GROQ_NOT_CONFIGURED') {
      return response.status(503).json({ error: 'Groq is not configured' });
    }
    const providerError = error as Error & { status?: number };
    if (providerError.status === 429) {
      return response.status(503).json({ error: 'AI recognition is temporarily rate limited. Use the tested-sign demo fallback.' });
    }
    console.error('WayFarer API error:', error.message);
    return response.status(502).json({ error: 'The guidance service is temporarily unavailable' });
  });

  return app;
}

export const app = createApp();
