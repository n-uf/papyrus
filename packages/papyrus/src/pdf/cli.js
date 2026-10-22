#!/usr/bin/env node
/**
 * papyrus - command line for the Papyrus documents engine.
 *
 *   papyrus pdf [options]
 *
 * Prints every document listed in papyrus.config.json to a PDF by loading the
 * viewer's print route in headless Chromium. The viewer must already be
 * running (dev server or `vite preview`).
 */

import path from "node:path";
import {
  DEFAULT_BASE_URL,
  DEFAULT_CONFIG_FILE,
  checkPdfs,
  exportPdfs,
  readConfig,
  waitForServer,
} from "./index.js";

const HELP = `papyrus - documents as HTML and PDF

Usage:
  papyrus pdf [options]

Options:
  --config <file>     Config file (default ./${DEFAULT_CONFIG_FILE})
  --base-url <url>    Server rendering the documents (default: config, else ${DEFAULT_BASE_URL})
  --port <n>          Shorthand for --base-url http://localhost:<n>
  --only <id>         Export a single document
  --out <dir>         Output folder (default: config outDir, else ./pdf)
  --wait <seconds>    Wait up to N seconds for the server to answer first
  --check             Do not print: report committed PDFs whose sources changed since
                      they were printed (exit 1 when any is stale or missing)
  -h, --help          Show this help

Environment:
  PAPYRUS_CHROMIUM_PATH   Use this Chromium/Chrome binary instead of Playwright's download

${DEFAULT_CONFIG_FILE}:
  {
    "outDir": "apps/viewer/public/docs",
    "baseUrl": "http://localhost:5173",
    "docUrl": "/docs/{id}?print=true",
    "sources": ["packages/docs/src/shared"],
    "docs": ["user-manual", { "id": "annual-report", "filename": "annual-report-2026.pdf",
             "sources": ["packages/docs/src/annual-report"] }]
  }

  "sources" (shared) and per-document "sources" are fingerprinted into
  <outDir>/papyrus-manifest.json when a PDF is printed; --check compares them.
`;

const FLAGS = new Set(["check"]);

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") args.help = true;
    else if (a.startsWith("--")) {
      const key = a.slice(2);
      if (FLAGS.has(key)) {
        args[key] = true;
        continue;
      }
      const value = argv[++i];
      if (value === undefined || value.startsWith("--")) {
        throw new Error(`Option --${key} needs a value.`);
      }
      args[key] = value;
    } else args._.push(a);
  }
  return args;
}

async function pdfCommand(args) {
  const loaded = readConfig(args.config);
  if (!loaded) {
    throw new Error(
      `No config found at ${path.resolve(args.config ?? DEFAULT_CONFIG_FILE)}. ` +
        `Create ${DEFAULT_CONFIG_FILE} (see --help).`,
    );
  }
  const { config, dir } = loaded;

  const baseUrl =
    args["base-url"] ??
    (args.port ? `http://localhost:${args.port}` : undefined) ??
    config.baseUrl ??
    DEFAULT_BASE_URL;
  const outDir = path.resolve(args.out ? process.cwd() : dir, args.out ?? config.outDir ?? "pdf");

  if (args.check) {
    const statuses = checkPdfs({ config, dir, outDir, only: args.only });
    for (const s of statuses) {
      console.log(`  ${s.status.padEnd(9)} ${s.id}${s.reason ? ` (${s.reason})` : ""}`);
    }
    const bad = statuses.filter((s) => s.status === "stale" || s.status === "missing");
    console.log(bad.length ? `\n${bad.length} PDF(s) out of date: run papyrus pdf.` : "\nAll checked PDFs are current.");
    if (bad.length) process.exitCode = 1;
    return;
  }

  if (args.wait) await waitForServer(baseUrl, Number(args.wait));

  const { failed } = await exportPdfs({
    baseUrl,
    outDir,
    docs: config.docs,
    docUrl: config.docUrl,
    only: args.only,
    config,
    configDir: dir,
  });
  if (failed.length) process.exitCode = 1;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];
  if (args.help || !command) {
    process.stdout.write(HELP);
    if (!args.help) process.exitCode = 1;
    return;
  }
  if (command === "pdf") return pdfCommand(args);
  throw new Error(`Unknown command "${command}". Try --help.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
