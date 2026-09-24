import { mkdir, readFile, writeFile } from 'node:fs/promises';

const rules = JSON.parse(await readFile(new URL('../shared/rules/rules.json', import.meta.url), 'utf8'));
const output = new URL('../frontend/public/signs/test/', import.meta.url);
await mkdir(output, { recursive: true });

const esc = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const frame = (body, label) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360" role="img" aria-label="${esc(label)}">
  <rect width="360" height="360" rx="24" fill="#f5f3ed"/>
  ${body}
</svg>`;
const circle = (inside, fill = '#fff', border = '#d72638') => `<circle cx="180" cy="170" r="116" fill="${fill}" stroke="${border}" stroke-width="20"/>${inside}`;
const label = (text, y = 176, size = 36, fill = '#14211c') => `<text x="180" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif" font-weight="800" font-size="${size}" fill="${fill}">${esc(text)}</text>`;
const slash = '<path d="M95 85 265 255" stroke="#d72638" stroke-width="22" stroke-linecap="round"/>';

function drawing(rule) {
  const c = rule.normalizedCategory;
  if (c === 'STOP' && rule.countryCode === 'JP') return `<path d="M62 74H298L180 302Z" fill="#d72638" stroke="#fff" stroke-width="9"/>${label('止まれ', 170, 50, '#fff')}${label('STOP', 220, 25, '#fff')}`;
  if (c === 'STOP') return `<path d="M105 48H255L312 105V255L255 312H105L48 255V105Z" fill="#c51f31" stroke="#fff" stroke-width="9"/>${label('STOP', 184, 62, '#fff')}`;
  if (c === 'NO_ENTRY' && rule.countryCode === 'JP') return circle('<rect x="75" y="148" width="210" height="44" rx="8" fill="#fff"/>', '#d72638', '#fff');
  if (c === 'NO_ENTRY') return circle(`${label('NO', 145, 42)}${label('ENTRY', 195, 38)}${slash}`);
  if (c === 'MAX_SPEED') return rule.countryCode === 'JP' ? circle(label('40', 178, 94)) : `${circle(label('40', 168, 82))}${label('SPEED LIMIT', 318, 24)}`;
  if (c === 'PEDESTRIAN_CROSSING' && rule.countryCode === 'JP') return `<rect x="55" y="45" width="250" height="250" rx="18" fill="#1769aa"/>${label('🚶', 170, 104, '#fff')}${label('CROSSING', 322, 23)}`;
  if (c === 'PEDESTRIAN_CROSSING') return `<path d="M180 35 325 180 180 325 35 180Z" fill="#f4c542" stroke="#171d1a" stroke-width="10"/>${label('🚶', 170, 90)}${label('PED XING', 318, 25)}`;
  if (c === 'NO_PARKING' && rule.countryCode === 'JP') return circle(`${label('P', 170, 100, '#fff')}${slash}`, '#1769aa');
  if (c === 'NO_PARKING') return `<rect x="52" y="72" width="256" height="216" rx="12" fill="#fff" stroke="#d72638" stroke-width="12"/>${label('NO', 142, 52, '#d72638')}${label('PARKING', 207, 46, '#d72638')}`;
  if (c === 'NO_U_TURN') return circle(`${label('↶', 165, 112, rule.countryCode === 'JP' ? '#fff' : '#101713')}${slash}`, rule.countryCode === 'JP' ? '#1769aa' : '#fff');
  if (c === 'SLOW') return `<path d="M62 74H298L180 302Z" fill="#fff" stroke="#d72638" stroke-width="18"/>${label('徐行', 168, 50)}${label('SLOW', 214, 24)}`;
  if (c === 'HORN_REQUIRED') return circle(`${label('📣', 168, 90, '#fff')}`, '#1769aa', '#fff');
  if (c === 'MOPED_TWO_STAGE_RIGHT') return circle(`${label('┐→', 150, 78, '#fff')}${label('MOPED', 228, 25, '#fff')}`, '#1769aa', '#fff');
  if (c === 'PRIORITY_ROAD_AHEAD') return `<path d="M62 74H298L180 302Z" fill="#fff" stroke="#d72638" stroke-width="18"/>${label('前方', 155, 40)}${label('優先道路', 202, 34)}`;
  if (c === 'TIRE_CHAINS_REQUIRED') return circle(`${label('CHAIN', 140, 34, '#fff')}${label('▦', 204, 72, '#fff')}`, '#1769aa', '#fff');
  if (c === 'BUS_PUJ_STOP') return `<rect x="48" y="60" width="264" height="240" rx="14" fill="#fff" stroke="#1769aa" stroke-width="12"/>${label('BUS–PUJ', 145, 40, '#1769aa')}${label('STOP', 210, 58, '#1769aa')}`;
  const words = { NO_JEEPNEYS: 'JEEPNEY', NO_TRICYCLES: 'TRICYCLE', NO_PUSHCARTS: 'PUSHCART', NO_ANIMAL_DRAWN_VEHICLES: 'HORSE CART' };
  return circle(`${label(words[c] || rule.officialName, 170, 30)}${slash}`);
}

for (const rule of rules) {
  if (!rule.assetPath.startsWith('/signs/test/')) continue;
  const filename = rule.assetPath.split('/').at(-1);
  await writeFile(new URL(filename, output), frame(drawing(rule), `${rule.countryCode} ${rule.officialName}`));
}

console.log(`Generated ${rules.length} semantic sign fixtures.`);
