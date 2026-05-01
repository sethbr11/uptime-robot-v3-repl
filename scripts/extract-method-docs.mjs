/**
 * Build src/generated/method-docs.json from uptime-robot-v3 .d.ts (JSDoc summary, @param, @example).
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const replRoot = path.join(__dirname, '..');

const directPkg = path.join(replRoot, 'node_modules', 'uptime-robot-v3', 'package.json');
let sdkRoot;
if (fs.existsSync(directPkg)) {
  sdkRoot = path.dirname(directPkg);
} else {
  const require = createRequire(path.join(replRoot, 'package.json'));
  try {
    sdkRoot = path.dirname(require.resolve('uptime-robot-v3/package.json'));
  } catch {
    console.error('Could not resolve uptime-robot-v3. Run npm install first.');
    process.exit(1);
  }
}

const FILES = [
  ['tools.d.ts', 'tools'],
  ['parts/monitors.d.ts', 'monitors'],
  ['parts/monitorsBulk.d.ts', 'monitors.bulk'],
  ['parts/psps.d.ts', 'psps'],
  ['parts/pspAnnouncements.d.ts', 'psps.announcements'],
  ['parts/maintenanceWindows.d.ts', 'maintenanceWindows'],
  ['parts/users.d.ts', 'users'],
  ['parts/integrations.d.ts', 'integrations'],
  ['parts/incidents.d.ts', 'incidents'],
  ['parts/monitorGroups.d.ts', 'monitorGroups'],
  ['parts/tags.d.ts', 'tags'],
];

/** True for ctor / validators / helpers that should not get bundled REPL summaries. */
function shouldSkipMethod(name) {
  return name === 'constructor' || name.startsWith('validate') || name === 'createFormData';
}

/**
 * Parse one JSDoc block: summary text before any @ tag, @param lines, @example fence.
 */
function parseMethodDoc(comment) {
  const rawLines = comment.split(/\r?\n/).map((l) => l.replace(/^\s*\* ?/, '').trimEnd());
  const summaryLines = [];
  const params = [];
  const exampleLines = [];
  let mode = 'summary';

  for (const line of rawLines) {
    const t = line.trim();

    if (t.startsWith('@example')) {
      mode = 'example';
      continue;
    }

    const paramDash = t.match(/^@param\s+(\S+)\s+-\s*(.*)$/);
    if (paramDash) {
      mode = 'param';
      params.push({ name: paramDash[1], lines: [paramDash[2] || ''] });
      continue;
    }
    const paramBare = t.match(/^@param\s+(\S+)\s*$/);
    if (paramBare) {
      mode = 'param';
      params.push({ name: paramBare[1], lines: [] });
      continue;
    }

    if (t.startsWith('@')) {
      mode = 'skip';
      continue;
    }

    if (mode === 'summary' && t) summaryLines.push(t);
    else if (mode === 'param' && params.length && t) params[params.length - 1].lines.push(t);
    else if (mode === 'example') exampleLines.push(line.replace(/\s+$/, ''));
  }

  const summary = summaryLines.join(' ').replace(/\s+/g, ' ').trim();
  const paramList = params.map((p) => ({
    name: p.name,
    description: p.lines.join(' ').replace(/\s+/g, ' ').trim(),
  }));

  let example = exampleLines.join('\n').trim();
  example = example.replace(/^```\w*\r?\n?/, '').replace(/\r?\n```\s*$/, '').trim();

  return { summary, params: paramList, example: example || undefined };
}

/**
 * Scans one `.d.ts` file for JSDoc comment blocks preceding instance methods under `prefix` and merges into `out`.
 * @param {string} prefix Dotted SDK path fragment (e.g. `monitors`, `monitors.bulk`)
 * @param {Record<string, { summary: string; params: { name: string; description: string }[]; example?: string }>} out Accumulator keyed by `${prefix}.${method}`
 */
function extractFromFile(content, prefix, out) {
  let pos = 0;
  while (pos < content.length) {
    const start = content.indexOf('/**', pos);
    if (start === -1) break;
    const end = content.indexOf('*/', start);
    if (end === -1) break;
    const comment = content.slice(start + 3, end);
    const rest = content.slice(end + 2);
    const methodMatch = rest.match(/^\s*\r?\n\s*(?:private\s+)?(\w+)\s*\(/);
    if (!methodMatch) {
      pos = start + 3;
      continue;
    }
    const method = methodMatch[1];
    if (shouldSkipMethod(method)) {
      pos = end + 2 + methodMatch.index + methodMatch[0].length;
      continue;
    }

    const parsed = parseMethodDoc(comment);
    if (!parsed.summary || parsed.summary === 'API METHODS' || parsed.summary === 'HELPER METHODS') {
      pos = end + 2;
      continue;
    }

    const key = `${prefix}.${method}`;
    if (!out[key]) out[key] = parsed;
    pos = end + 2 + methodMatch.index + methodMatch[0].length;
  }
}

const out = Object.create(null);
for (const [rel, prefix] of FILES) {
  const full = path.join(sdkRoot, 'dist', rel);
  if (!fs.existsSync(full)) {
    console.warn('skip missing', rel);
    continue;
  }
  extractFromFile(fs.readFileSync(full, 'utf8'), prefix, out);
}

const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
const target = path.join(replRoot, 'src', 'generated', 'method-docs.json');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
console.log(`Wrote ${Object.keys(sorted).length} entries to ${path.relative(replRoot, target)}`);
