import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const cli = join(repoRoot, 'dist', 'cli.js');

describe('cli', () => {
  it('exits 1 without UPTIMEROBOT_API_KEY', () => {
    const env = { ...process.env };
    delete env.UPTIMEROBOT_API_KEY;
    const result = spawnSync(process.execPath, [cli], { env, encoding: 'utf8' });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('UPTIMEROBOT_API_KEY');
  });
});
