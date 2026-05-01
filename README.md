# uptime-robot-v3-repl

[![npm](https://img.shields.io/npm/v/uptime-robot-v3-repl.svg)](https://www.npmjs.com/package/uptime-robot-v3-repl)
[![CI](https://github.com/sethbr11/uptime-robot-v3-repl/actions/workflows/ci.yml/badge.svg)](https://github.com/sethbr11/uptime-robot-v3-repl/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18-417505?logo=node.js&logoColor=white)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](tsconfig.json)

Small interactive **REPL** for calling the [Uptime Robot API v3](https://uptimerobot.com/api/v3) through the **[`uptime-robot-v3`](https://www.npmjs.com/package/uptime-robot-v3)** SDK.

## Requirements

- Node.js **18+**
- An Uptime Robot **main API key** in `UPTIMEROBOT_API_KEY`

## Usage

```bash
UPTIMEROBOT_API_KEY=your_key npx uptime-robot-v3-repl
```

Or install globally:

```bash
npm install -g uptime-robot-v3-repl
UPTIMEROBOT_API_KEY=your_key ur-repl
```

In the REPL, the client is exposed as **`service`** (an `UptimeRobotService`). Examples:

```js
await service.monitors.list();
await service.users.me();
```

### Help (local summaries + TypeDoc)

Summaries ship as JSON built from **`uptime-robot-v3` declaration/JSDoc** (not by parsing `.ts` in the REPL). In this repo the generated file lives at [`src/generated/method-docs.json`](src/generated/method-docs.json); `npm run build` copies it into `dist/generated/method-docs.json` for the runnable package. Regenerate after upgrading the SDK:

```bash
npm run generate:docs
```

This runs automatically before each `npm run build` (`prebuild`).

- **`help()`** — each method shows a **short local description** (truncated); one footer line with your TypeDoc base URL.
- **`help("create")`** etc. — **full paragraph** from the same source, then the TypeDoc URL for signatures/examples.

Override the docs base with **`UPTIMEROBOT_DOCS_BASE`** if needed.

## Develop against a local SDK checkout

If you are hacking **`uptime-robot-v3`** next to this repo, point the dependency at the folder and reinstall:

```json
"dependencies": {
  "uptime-robot-v3": "file:../uptime-robot-v3"
}
```

Then:

```bash
npm install
npm run build
UPTIMEROBOT_API_KEY=your_key npm start
```

## License

[ISC](LICENSE)
