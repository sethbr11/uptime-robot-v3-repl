/**
 * Base URL for generated TypeDoc (GitHub Pages). Override with env `UPTIMEROBOT_DOCS_BASE` if paths move.
 * @returns Normalized base URL ending with `/`
 */
export function getDocsBase(): string {
  const raw = process.env.UPTIMEROBOT_DOCS_BASE?.trim();
  if (raw) return raw.replace(/\/?$/, '/');
  return 'https://sethbr11.github.io/uptime-robot-v3/';
}
