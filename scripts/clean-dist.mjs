/**
 * Deletes the `dist/` build output so stale `.js`/`.json` artifacts are not packed after renames/refactors.
 */
import { rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
rmSync(join(root, 'dist'), { recursive: true, force: true });
