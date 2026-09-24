import { useEffect, useMemo, useState } from 'react';
import { compareSigns, listRecognitionTests, listRules, recognizeSign } from '../guidance';
import type { ComparisonResult, CountryCode, RecognitionResult, RecognitionTestCase, RuleRecord } from '../guidance/types';

type Variation = 'original' | 'angled' | 'dim' | 'color-shift' | 'cropped' | 'occluded' | 'resized' | 'busy-background';
type RowResult = { predicted: string; confidence: number; semanticMatch: boolean; result: 'PASS' | 'FAIL' };

const variations: Array<{ id: Variation; label: string }> = [
  { id: 'original', label: 'Original' }, { id: 'angled', label: 'Photo angle' }, { id: 'dim', label: 'Low light' },
  { id: 'color-shift', label: 'Color shift' },
  { id: 'cropped', label: 'Cropped edges' }, { id: 'occluded', label: 'Partial obstruction' },
  { id: 'resized', label: 'Small sign' }, { id: 'busy-background', label: 'Different background' },
];

function fileDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('The image could not be read.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The test image could not be loaded.'));
    image.src = source;
  });
}

async function applyVariation(source: string, variation: Variation): Promise<string> {
  const image = await loadImage(source);
  const canvas = document.createElement('canvas');
  canvas.width = 640; canvas.height = 480;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Image processing is unavailable.');
  context.fillStyle = variation === 'busy-background' ? '#4d6572' : '#ecebe5';
  context.fillRect(0, 0, 640, 480);
  if (variation === 'busy-background') {
    context.strokeStyle = '#d6b85a'; context.lineWidth = 18;
    for (let y = 50; y < 480; y += 90) { context.beginPath(); context.moveTo(0, y); context.lineTo(640, y + 50); context.stroke(); }
  }
  const scale = variation === 'resized' ? 0.36 : variation === 'cropped' ? 1.22 : 0.82;
  const width = 360 * scale; const height = 360 * scale;
  context.save();
  context.translate(320, 240);
  if (variation === 'angled') { context.rotate(-0.22); context.transform(1, 0.08, -0.18, 1, 0, 0); }
  if (variation === 'dim') context.filter = 'brightness(45%) contrast(85%)';
  if (variation === 'color-shift') context.filter = 'hue-rotate(18deg) saturate(75%)';
  context.drawImage(image, -width / 2, -height / 2, width, height);
  context.restore();
  if (variation === 'occluded') { context.fillStyle = '#66706b'; context.fillRect(310, 105, 105, 220); }
  return canvas.toDataURL('image/jpeg', 0.88);
}

function DebugPanel({ result }: { result: RecognitionResult | null }) {
  if (!result) return <div className="lab-empty">Run a recognition test to inspect the model output.</div>;
  const debug = result.debug;
  return <dl className="debug-grid">
    <div><dt>Detected country</dt><dd>{debug.detectedCountry ?? 'Unknown'}</dd></div>
    <div><dt>Detected sign</dt><dd>{debug.detectedSign ?? 'Unknown'}</dd></div>
    <div><dt>Normalized category</dt><dd><code>{debug.normalizedCategory ?? 'UNKNOWN'}</code></dd></div>
    <div><dt>Meaning</dt><dd>{result.rule?.meaning ?? debug.closestReference?.meaning ?? 'No reliable meaning'}</dd></div>
    <div><dt>Confidence</dt><dd>{Math.round(debug.confidence * 100)}%</dd></div>
    <div><dt>Closest reference</dt><dd>{debug.closestReference?.label ?? 'None'}</dd></div>
    <div><dt>Visual similarity</dt><dd>{Math.round(debug.visualSimilarity * 100)}%</dd></div>
    <div><dt>Semantic similarity</dt><dd>{Math.round(debug.semanticSimilarity * 100)}%</dd></div>
    <div><dt>Match type</dt><dd><strong className={`match-${debug.matchType.toLowerCase()}`}>{debug.matchType}</strong></dd></div>
    <div><dt>Equivalent in other country</dt><dd>{debug.equivalentSign?.label ?? 'None in catalog'}</dd></div>
    <div className="debug-evidence"><dt>Evidence used</dt><dd>Shape: {debug.evidence.shape || '—'} · Symbol: {debug.evidence.symbol || '—'} · Text: {debug.evidence.text || '—'} · Color: {debug.evidence.color || '—'}</dd></div>
  </dl>;
}

export function RecognitionLab() {
  const [tests, setTests] = useState<RecognitionTestCase[]>([]);
  const [catalog, setCatalog] = useState<RuleRecord[]>([]);
  const [rows, setRows] = useState<Record<string, RowResult>>({});
  const [country, setCountry] = useState<CountryCode>('JP');
  const [source, setSource] = useState<string | null>(null);
  const [variation, setVariation] = useState<Variation>('original');
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([listRecognitionTests(), listRules('JP'), listRules('PH')])
      .then(([testCases, japan, philippines]) => { if (active) { setTests(testCases); setCatalog([...japan, ...philippines]); } })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Test catalog unavailable.'); });
    return () => { active = false; };
  }, []);
  const pairs = useMemo(() => tests.filter((test) => test.testType === 'equivalent' && test.countryCode === 'JP'), [tests]);
  const catalogByCountryAndCategory = useMemo(() => new Map(catalog.map((record) => [`${record.countryCode}:${record.normalizedCategory}`, record])), [catalog]);

  async function runSource(imageSource: string, countryCode: CountryCode, expected?: RecognitionTestCase) {
    setBusy(true); setError(null);
    try {
      const prepared = await applyVariation(imageSource, variation);
      setPreview(prepared);
      const detected = await recognizeSign(countryCode, prepared);
      setResult(detected);
      if (expected) {
        const predicted = detected.debug.normalizedCategory ?? 'UNKNOWN';
        const meaningfulMatch = detected.debug.matchType === 'EXACT_MATCH' || detected.debug.matchType === 'SEMANTIC_MATCH';
        const pass = predicted === expected.expectedCategory && detected.debug.detectedCountry === expected.countryCode && meaningfulMatch;
        setRows((current) => ({ ...current, [expected.id]: { predicted, confidence: detected.debug.confidence, semanticMatch: pass, result: pass ? 'PASS' : 'FAIL' } }));
      }
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Recognition failed.'); }
    finally { setBusy(false); }
  }

  async function runPair(japan: RecognitionTestCase) {
    const philippines = tests.find((test) => test.id === japan.pairId);
    if (!philippines) return;
    setBusy(true); setError(null);
    try {
      const [left, right] = await Promise.all([applyVariation(japan.assetPath, variation), applyVariation(philippines.assetPath, variation)]);
      setComparison(await compareSigns({ countryCode: 'JP', imageDataUrl: left }, { countryCode: 'PH', imageDataUrl: right }));
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Comparison failed.'); }
    finally { setBusy(false); }
  }

  return <section className="recognition-lab" aria-labelledby="lab-title">
    <div className="page-heading"><div><p className="eyebrow">Parked testing tool</p><h1 id="lab-title">Semantic sign recognition lab</h1><p>Test meaning across country designs. The classifier uses visual and OCR evidence, then maps the result to a normalized traffic-sign category.</p></div><span className="status-badge warning">Candidate dataset · silent</span></div>
    <div className="lab-grid">
      <article className="detail-card lab-input"><p className="panel-kicker">Single image</p><h2>Upload or select a sign</h2>
        <label>Country hint<select value={country} onChange={(event) => setCountry(event.target.value as CountryCode)}><option value="JP">Japan</option><option value="PH">Philippines</option></select></label>
        <label>Visual variation<select value={variation} onChange={(event) => setVariation(event.target.value as Variation)}>{variations.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</select></label>
        <label className="lab-upload">Upload image<input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={(event) => { const file = event.target.files?.[0]; if (file) void fileDataUrl(file).then((value) => { setSource(value); setPreview(value); }); }} /></label>
        {preview && <img className="lab-preview" src={preview} alt="Recognition test input" />}
        <button className="button button-primary" disabled={!source || busy} onClick={() => source && void runSource(source, country)}>{busy ? 'Analyzing…' : 'Analyze sign'}</button>
        <p className="lab-note">Variations are rendered client-side; the model never receives a filename or expected label.</p>
      </article>
      <article className="detail-card lab-output"><p className="panel-kicker">Recognition trace</p><h2>Why it matched</h2><DebugPanel result={result} /></article>
    </div>
    {error && <div className="scope-callout" role="alert"><strong>Test error:</strong> {error}</div>}

    <article className="detail-card pair-lab"><div><p className="panel-kicker">Cross-country equivalence</p><h2>Compare Japan ↔ Philippines</h2><p>A pair passes semantically when both images normalize to the same category even when their visual similarity is lower.</p></div>
      <div className="pair-buttons">{pairs.map((pair) => <button key={pair.id} disabled={busy} onClick={() => void runPair(pair)}>{pair.expectedCategory.replaceAll('_', ' ')}</button>)}</div>
      {comparison && <div className="pair-result"><strong>{comparison.matchType}</strong><span>Semantic match: {comparison.semanticMatch ? 'TRUE' : 'FALSE'}</span><span>{comparison.first.debug.detectedSign ?? 'Unknown'} ↔ {comparison.second.debug.detectedSign ?? 'Unknown'}</span></div>}
    </article>

    <article className="detail-card matrix-card"><div className="matrix-heading"><div><p className="panel-kicker">Controlled test catalog</p><h2>Recognition test matrix</h2></div><p>Run rows individually to avoid unnecessary provider calls. Try each row under all eight variations.</p></div>
      <div className="table-scroll"><table className="test-matrix"><thead><tr><th>Input</th><th>Expected category</th><th>Predicted category</th><th>Country</th><th>Confidence</th><th>Semantic match</th><th>Result</th><th /></tr></thead><tbody>
        {tests.map((test) => { const row = rows[test.id]; const record = catalogByCountryAndCategory.get(`${test.countryCode}:${test.expectedCategory}`); return <tr key={test.id}><td><img src={test.assetPath} alt="" /><span>{record?.officialName ?? test.input}<small>{test.countryCode} · {record?.meaning ?? test.testType}</small></span></td><td><code>{test.expectedCategory}</code></td><td><code>{row?.predicted ?? 'NOT RUN'}</code></td><td>{test.countryCode}</td><td>{row ? `${Math.round(row.confidence * 100)}%` : '—'}</td><td>{row ? String(row.semanticMatch).toUpperCase() : '—'}</td><td><strong className={row?.result === 'PASS' ? 'test-pass' : row ? 'test-fail' : ''}>{row?.result ?? 'NOT RUN'}</strong></td><td><button disabled={busy} onClick={() => void runSource(test.assetPath, test.countryCode, test)}>Run</button></td></tr>; })}
      </tbody></table></div>
    </article>
  </section>;
}
