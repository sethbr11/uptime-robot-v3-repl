#!/usr/bin/env node
import repl from 'node:repl';
import { UptimeRobotService } from 'uptime-robot-v3';
import { printBanner } from './banner.js';
import { makeHelpCommand } from './repl-help.js';
import { ansi } from './ansi.js';

/**
 * Reads the main API key from `process.env`; prints a usage hint and exits if missing.
 * @returns Trimmed API key string
 */
function readApiKey(): string {
  const key = process.env.UPTIMEROBOT_API_KEY?.trim();
  if (!key) {
    console.error(
      ansi.red('Missing UPTIMEROBOT_API_KEY.') +
        '\nExample:\n' +
        ansi.gray('  UPTIMEROBOT_API_KEY=your_key npx uptime-robot-v3-repl'),
    );
    process.exit(1);
  }
  return key;
}

/** Starts the interactive REPL with `service` and `help` bound on the eval context. */
function main(): void {
  const service = new UptimeRobotService({ apiKey: readApiKey() });

  printBanner();

  const server = repl.start({
    prompt: 'uptime> ',
    useColors: true,
  });

  server.context.service = service;
  server.context.help = makeHelpCommand(service);

  server.on('exit', () => {
    console.log(ansi.green('Exiting UptimeRobot REPL...'));
    process.exit(0);
  });
}

main();
