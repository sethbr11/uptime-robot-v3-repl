import { describe, expect, it } from 'vitest';
import {
  docKey,
  firstLeadSentence,
  getMethodDoc,
  METHOD_DOC_COUNT,
} from '../src/method-docs.js';

describe('method-docs', () => {
  it('docKey strips service.', () => {
    expect(docKey('service.monitors', 'list')).toBe('monitors.list');
    expect(docKey('monitors', 'list')).toBe('monitors.list');
  });

  it('getMethodDoc returns known entry', () => {
    expect(METHOD_DOC_COUNT).toBeGreaterThan(0);
    const doc = getMethodDoc('service.monitors', 'list');
    expect(doc).toBeDefined();
    expect(doc!.summary.length).toBeGreaterThan(0);
  });

  it('firstLeadSentence', () => {
    expect(firstLeadSentence('Hello world. Next.')).toBe('Hello world.');
    expect(firstLeadSentence('No period')).toBe('No period');
  });
});
