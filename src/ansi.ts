/**
 * Terminal styling (aligned with the legacy help-generator palette).
 * cyan=headers, green=categories/emphasis, gray=muted, yellow=tips/warnings, red=errors
 */
export const ansi = {
  /** Clears ANSI styles (reset sequence). */
  reset: '\x1b[0m',
  /** Renders plain text using cyan foreground and reset for header lines. */
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  /** Renders plain text using green foreground and reset (emphasis / categories). */
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  /** Renders plain text using bright black / gray foreground and reset. */
  gray: (s: string) => `\x1b[90m${s}\x1b[0m`,
  /** Renders plain text using yellow foreground and reset. */
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  /** Renders plain text using red foreground and reset (errors). */
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  /** Renders plain text bold (ANSI bold on + reset). */
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  /** Repeats `ch` `n` times and wraps with cyan styling (divider line). */
  lineCyan: (ch: string, n = 80) => ansi.cyan(ch.repeat(n)),
  /** Repeats `ch` `n` times and wraps with gray styling (divider line). */
  lineGray: (ch: string, n = 80) => ansi.gray(ch.repeat(n)),
} as const;
