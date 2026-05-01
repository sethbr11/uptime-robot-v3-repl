import { describe, expect, it } from 'vitest';
import { wrapParagraph } from '../src/repl-help.js';

describe('wrapParagraph', () => {
  it('keeps lines within width', () => {
    const lines = wrapParagraph('one two three four five', 10);
    expect(lines.every((l) => l.length <= 10)).toBe(true);
    expect(lines.join(' ')).toBe('one two three four five');
  });

  it('handles empty whitespace-only input', () => {
    expect(wrapParagraph('   ', 20)).toEqual([]);
  });
});
