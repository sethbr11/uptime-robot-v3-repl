import docs from './generated/method-docs.json' with { type: 'json' };

export type MethodDocEntry = {
  summary: string;
  params: Array<{ name: string; description: string }>;
  example?: string;
};

const map = docs as Record<string, MethodDocEntry>;

/**
 * Map key for bundled docs (`resourceAccess.method`), normalizing optional `service.` prefix on access.
 */
export function docKey(access: string, method: string): string {
  return `${access.replace(/^service\./, '')}.${method}`;
}

/**
 * Loaded JSDoc entry for `access.method` from the bundled `method-docs.json` map, if present.
 */
export function getMethodDoc(access: string, method: string): MethodDocEntry | undefined {
  return map[docKey(access, method)];
}

/**
 * Takes the first sentence of `summary` (text up through the first `.`) for compact one-line previews.
 */
export function firstLeadSentence(summary: string): string {
  const t = summary.replace(/\s+/g, ' ').trim();
  const i = t.indexOf('.');
  return i === -1 ? t : t.slice(0, i + 1);
}

/** Total number of `{resource}.{method}` entries in bundled `method-docs.json`. */
export const METHOD_DOC_COUNT = Object.keys(map).length;
