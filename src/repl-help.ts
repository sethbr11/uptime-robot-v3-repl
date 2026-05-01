import type { UptimeRobotService } from 'uptime-robot-v3';
import { ansi } from './ansi.js';
import { firstLeadSentence, getMethodDoc } from './method-docs.js';
import {
  RESOURCE_ENTRIES,
  listInstanceMethods,
  getResourceTarget,
  classDocsUrl,
  type ResourceEntry,
} from './client-paths.js';
import { getDocsBase } from './docs-base.js';

export type MethodRef = {
  access: string;
  method: string;
  entry: ResourceEntry;
};

/**
 * Flattens all REPL-listed methods across {@link RESOURCE_ENTRIES} with their dotted access paths.
 */
function collectMethods(service: UptimeRobotService): MethodRef[] {
  const out: MethodRef[] = [];
  for (const entry of RESOURCE_ENTRIES) {
    const target = getResourceTarget(service, entry);
    for (const method of listInstanceMethods(target)) {
      out.push({ access: entry.access, method, entry });
    }
  }
  return out;
}

/**
 * Greedy word-wrap for terminal columns: prefers earlier breaks; each line is ≤ `width` characters.
 */
export function wrapParagraph(text: string, width: number): string[] {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if (!line.length) line = w;
    else if (line.length + 1 + w.length <= width) line += ` ${w}`;
    else {
      lines.push(line);
      line = w;
    }
  }
  if (line.length) lines.push(line);
  return lines;
}

/** Prints indented example lines in muted gray after normalizing CRLF → LF and trimming the block. */
function printExampleBlock(code: string, indent: string): void {
  const stripped = code.replace(/\r\n/g, '\n').trim();
  for (const ln of stripped.split('\n')) {
    console.log(`${indent}${ansi.gray(ln)}`);
  }
}

/**
 * Prints the full method index grouped by catalogue category — each line shows `access.method()` plus a truncated summary.
 */
export function printHelpOverview(service: UptimeRobotService): void {
  const base = getDocsBase();
  const all = collectMethods(service);

  if (all.length === 0) {
    console.log(ansi.red('❌ No API methods found on service (unexpected).'));
    return;
  }

  console.log(`\n${ansi.cyan('📖 UptimeRobot API (v3) — REPL method index')}`);
  console.log(ansi.lineCyan('═', 80));

  const byCategory = new Map<string, MethodRef[]>();
  for (const ref of all) {
    const cat = ref.entry.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(ref);
  }

  for (const entry of RESOURCE_ENTRIES) {
    const refs = byCategory.get(entry.category);
    if (!refs?.length) continue;

    console.log(`\n${ansi.green(entry.category.toUpperCase())}`);
    console.log(ansi.lineGray('─', 80));

    for (const ref of refs.sort((a, b) => a.method.localeCompare(b.method))) {
      const call = `${ref.access}.${ref.method}()`;
      const doc = getMethodDoc(ref.access, ref.method);
      const lead = doc
        ? ansi.gray(firstLeadSentence(doc.summary))
        : ansi.gray('(no doc — npm run generate:docs)');
      console.log(`  ${ansi.bold(call)}  ${lead}`);
    }
  }

  console.log(
    `\n${ansi.cyan('💡 help("group.name") — full summary + params + example + TypeDoc. Example: help("tags.list")')}`,
  );
  console.log(ansi.gray(`💡 Reference: ${base}`));
  console.log(ansi.yellow('\nExit with .exit or Ctrl+D'));
}

/**
 * Prints help for `query`: empty → {@link printHelpOverview}; non-empty → fuzzy match, then detail or ambiguity list.
 */
export function printMethodHelp(service: UptimeRobotService, query: string): void {
  const q = query.trim().toLowerCase();
  if (!q) {
    printHelpOverview(service);
    return;
  }

  const base = getDocsBase();
  const all = collectMethods(service);
  const exact = all.filter((r) => r.method.toLowerCase() === q);
  const matches =
    exact.length > 0
      ? exact
      : all.filter(
          (r) =>
            r.method.toLowerCase().includes(q) ||
            `${r.access}.${r.method}`.toLowerCase().includes(q),
        );

  if (matches.length === 0) {
    console.log(ansi.red(`❌ No method matched "${query}".`));
    console.log(
      ansi.cyan('💡 Try help() for the index, help("tags.list") for a qualified name, or help("list") to search.'),
    );
    return;
  }

  if (matches.length > 1) {
    console.log(ansi.cyan(`\n📖 ${matches.length} matches for "${query}":\n`));
    for (const ref of matches) {
      const url = `${classDocsUrl(ref.entry, base)}#${ref.method}`;
      const doc = getMethodDoc(ref.access, ref.method);
      console.log(`  ${ansi.green(ref.access + '.' + ref.method + '()')}`);
      if (doc) {
        console.log(`    ${ansi.gray(firstLeadSentence(doc.summary))}`);
      }
      console.log(`    ${ansi.gray(url)}`);
      console.log('');
    }
    return;
  }

  const ref = matches[0]!;
  const url = `${classDocsUrl(ref.entry, base)}#${ref.method}`;
  const doc = getMethodDoc(ref.access, ref.method);

  console.log(`\n${ansi.cyan(ref.access + '.' + ref.method + '()')}`);
  console.log(ansi.lineCyan('═', 60));

  if (doc) {
    console.log(ansi.bold('Summary'));
    for (const ln of wrapParagraph(doc.summary, 74)) {
      console.log(`  ${ln}`);
    }
    console.log('');

    const params = doc.params.filter((p) => p.description.length > 0);
    if (params.length > 0) {
      console.log(ansi.bold('Parameters'));
      for (const p of params) {
        console.log(`  ${ansi.green('•')} ${ansi.bold(p.name)} — ${p.description}`);
      }
      console.log('');
    }

    if (doc.example) {
      console.log(ansi.bold('Example'));
      printExampleBlock(doc.example, '  ');
      console.log('');
    }
  } else {
    console.log(
      ansi.gray(
        '(No bundled doc — run npm run generate:docs after updating uptime-robot-v3.)\n',
      ),
    );
  }

  console.log(ansi.bold('TypeDoc'));
  console.log(`  ${ansi.gray(url)}\n`);
  console.log(ansi.cyan('REPL'));
  console.log(ansi.gray(`  await ${ref.access}.${ref.method}(...)`));
}

/**
 * Returns the function bound as REPL `help`: `help()` for the full index, `help("list")` etc. for scoped help.
 */
export function makeHelpCommand(service: UptimeRobotService): (methodName?: string) => void {
  return (methodName?: string) => {
    try {
      if (methodName == null || String(methodName).trim() === '') {
        printHelpOverview(service);
      } else {
        printMethodHelp(service, String(methodName));
      }
    } catch (e) {
      console.log(ansi.red('❌ Could not build help:'), (e as Error).message);
    }
  };
}
