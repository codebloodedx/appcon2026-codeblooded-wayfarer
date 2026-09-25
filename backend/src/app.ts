import express, { type NextFunction, type Request, type Response } from 'express';
import { BriefingRepository } from './briefings.js';
import { DrivingGuidanceRepository } from './drivingGuidance.js';
import { GeminiGuidanceModel } from './gemini.js';
import { exactVisualThreshold, semanticMatchThreshold, type GuidanceModel } from './guidanceModel.js';
import { parseImageDataUrl } from './image.js';
import { RuleRepository } from './rules.js';
import { isCountryCode, type MatchType, type ModelRecognition, type RuleRecord } from './types.js';

type AppDependencies = { rules?: RuleRepository; briefings?: BriefingRepository; drivingGuidance?: DrivingGuidanceRepository; model?: GuidanceModel };

export function createApp(dependencies: AppDependencies = {}) {
  const app = express();
  const rules = dependencies.rules || new RuleRepository();
  const briefings = dependencies.briefings || new BriefingRepository();
  const drivingGuidance = dependencies.drivingGuidance || new DrivingGuidanceRepository();
  const model = dependencies.model || new GeminiGuidanceModel();

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
      const rawLocality = request.query.locality;
      const locality = typeof rawLocality === 'string' ? rawLocality : undefined;
      const rawHomeCountry = request.query.homeCountry;
      const homeCountry = isCountryCode(rawHomeCountry) ? rawHomeCountry : undefined;
      if (!isCountryCode(countryCode)) return response.status(400).json({ error: 'countryCode must be JP or PH' });
      if (rawHomeCountry !== undefined && !homeCountry) return response.status(400).json({ error: 'homeCountry must be JP or PH' });
      if (rawLocality !== undefined && (locality === undefined || locality.trim().length > 100)) {
        return response.status(400).json({ error: 'locality must be 100 characters or fewer' });
      }
      const items = await briefings.testedForTrip(countryCode, locality?.trim(), homeCountry);
      if (items.length === 0) {
        return response.json({ status: 'unavailable', countryCode, homeCountry: homeCountry || null, locality: locality?.trim() || null, items: [], speechText: null });
      }
      const destinationName = countryCode === 'JP' ? 'Japan' : 'the Philippines';
      const speechText = `Before you drive in ${destinationName}, here are ${items.length} important reminders. ${items.map((item) => item.spokenText).join(' ')}`;
      response.setHeader('Cache-Control', 'private, max-age=3600');
      return response.json({ status: 'ready', countryCode, homeCountry: homeCountry || null, locality: locality?.trim() || null, items, speechText });
    } catch (error) {
      return next(error);
    }
  });

  app.get('/api/driving-guidance', async (request, response, next) => {
    try {
      const countryCode = request.query.countryCode;
      const rawLocality = request.query.locality;
      const locality = typeof rawLocality === 'string' ? rawLocality : undefined;
      if (!isCountryCode(countryCode)) return response.status(400).json({ error: 'countryCode must be JP or PH' });
      if (rawLocality !== undefined && (locality === undefined || locality.trim().length > 100)) {
        return response.status(400).json({ error: 'locality must be 100 characters or fewer' });
      }
      const rules = await drivingGuidance.available(countryCode, locality?.trim());
      response.setHeader('Cache-Control', 'private, max-age=3600');
      return response.json({ countryCode, locality: locality?.trim() || null, rules });
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
      const catalog = await rules.all();
      const prediction = await model.recognize(image, countryCode, catalog);
      return response.json(resolveRecognition(countryCode, catalog, prediction));
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
      const rule = await rules.findByCountry(countryCode, signId);
      if (!rule) return response.status(404).json({ error: 'No reviewed rule matches this country and sign' });
      const answer = await model.explain(rule, question.trim());
      return response.json({ answer, sourceUrl: rule.sourceUrl, status: rule.status });
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
    if (error.message === 'GEMINI_NOT_CONFIGURED') {
      return response.status(503).json({ error: 'Gemini is not configured' });
    }
    const providerError = error as Error & { status?: number };
    if (providerError.status === 402) {
      return response.status(503).json({
        error: 'Gemini credits are depleted for the configured API key. Update the Gemini billing or key to restore live sign recognition.',
        code: 'GEMINI_BILLING_REQUIRED',
      });
    }
    if (providerError.status === 429) {
      const retryAfterSeconds = providerRetryAfter(error) ?? 60;
      console.warn(JSON.stringify({
        level: 'warn',
        event: 'gemini_rate_limited',
        providerStatus: 429,
        retryAfterSeconds,
        detail: safeProviderDiagnostic(error),
      }));
      response.setHeader('Retry-After', String(retryAfterSeconds));
      return response.status(503).json({
        error: `Live recognition is rate limited. Retrying in ${retryAfterSeconds} seconds.`,
        code: 'RATE_LIMITED',
        retryAfterSeconds,
      });
    }
    console.error('WayFarer API error:', error.message);
    return response.status(502).json({ error: 'The guidance service is temporarily unavailable' });
  });

  return app;
}

function providerRetryAfter(error: Error): number | null {
  const headers = (error as Error & { headers?: { get?: (name: string) => string | null } }).headers;
  const raw = headers?.get?.('retry-after');
  const seconds = raw ? Number(raw) : Number.NaN;
  return Number.isFinite(seconds) && seconds > 0 ? Math.min(3600, Math.ceil(seconds)) : null;
}

function safeProviderDiagnostic(error: Error): string {
  return error.message
    .replace(/AIza[0-9A-Za-z_-]{20,}/g, '[REDACTED_API_KEY]')
    .replace(/AQ\.[0-9A-Za-z_-]{20,}/g, '[REDACTED_API_KEY]')
    .replace(/([?&](?:key|api[_-]?key)=)[^&\s]+/gi, '$1[REDACTED]')
    .slice(0, 2_000);
}

const app = createApp();
export default app;

function resolveRecognition(countryCode: 'JP' | 'PH', catalog: RuleRecord[], prediction: ModelRecognition) {
  const closest = prediction.closestReferenceId ? catalog.find((item) => item.id === prediction.closestReferenceId) : undefined;
  const predictedRule = prediction.modelClass ? catalog.find((item) => item.modelClass === prediction.modelClass) : undefined;
  const localRule = predictedRule?.semanticEquivalent
    ? catalog.find((item) => item.countryCode === countryCode && item.modelClass === predictedRule.semanticEquivalent)
    : undefined;
  const rule = predictedRule?.countryCode === countryCode ? predictedRule : localRule;
  const equivalent = rule?.semanticEquivalent ? catalog.find((item) => item.modelClass === rule.semanticEquivalent) || null : null;
  const matchType: MatchType = !prediction.normalizedCategory || !prediction.modelClass
    ? 'NO_MATCH'
    : predictedRule?.id === rule?.id && closest?.id === rule?.id && prediction.visualSimilarity >= exactVisualThreshold
      ? 'EXACT_MATCH'
      : rule && prediction.semanticSimilarity >= semanticMatchThreshold
        ? 'SEMANTIC_MATCH'
        : predictedRule ? 'RELATED' : 'NO_MATCH';
  const debug = { ...prediction, closestReference: closest || null, matchType, equivalentSign: equivalent };
  if (!rule || (matchType !== 'EXACT_MATCH' && matchType !== 'SEMANTIC_MATCH')) {
    return { status: 'unknown', signId: null, rule: null, debug };
  }
  if (rule.status !== 'tested') return { status: 'candidate', signId: rule.id, rule, debug };
  return { status: 'recognized', signId: rule.id, rule, debug };
}
