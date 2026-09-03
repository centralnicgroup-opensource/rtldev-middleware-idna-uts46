#!/usr/bin/env node
"use strict";

import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { toAscii, toUnicode } from "./index.js";

const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);

const USAGE = `Usage: idna-uts46-hx [options] [domain ...]

Convert domain names between Unicode (IDN) and Punycode (ASCII) using
UTS #46 processing. Domains may also be piped in via stdin, one per line.

Options:
  -t, --to <mode>          ascii | unicode | both   (default: both)
  -j, --json               emit JSON instead of plain text
  -s, --separator <sep>    column separator for mode "both" (default: tab)
      --transitional       force transitional processing on
      --no-transitional    force transitional processing off
                           (default: auto-detected from the TLD)
      --std3               apply useSTD3ASCIIRules
      --verify-dns-length  apply verifyDNSLength
      --check-hyphens      apply checkHyphens
      --check-bidi         apply checkBidi
      --check-joiners      apply checkJoiners
  -h, --help               show this help
  -v, --version            show the version

Exit codes: 0 = all conversions succeeded, 1 = at least one failed,
2 = invalid usage.

Examples:
  idna-uts46-hx öbb.at
  idna-uts46-hx --to ascii faß.de
  idna-uts46-hx --to unicode xn----5da7e.de
  cat domains.txt | idna-uts46-hx --json
`;

const OPTIONS = {
  to: { type: "string", short: "t", default: "both" },
  json: { type: "boolean", short: "j", default: false },
  separator: { type: "string", short: "s", default: "\t" },
  transitional: { type: "boolean", default: false },
  "no-transitional": { type: "boolean", default: false },
  std3: { type: "boolean", default: false },
  "verify-dns-length": { type: "boolean", default: false },
  "check-hyphens": { type: "boolean", default: false },
  "check-bidi": { type: "boolean", default: false },
  "check-joiners": { type: "boolean", default: false },
  help: { type: "boolean", short: "h", default: false },
  version: { type: "boolean", short: "v", default: false },
};

class UsageError extends Error {}

function toTr46Options(values) {
  const options = {};
  if (values.transitional && values["no-transitional"]) {
    throw new UsageError(
      "Options --transitional and --no-transitional are mutually exclusive.",
    );
  }
  if (values.transitional) {
    options.transitionalProcessing = true;
  }
  if (values["no-transitional"]) {
    options.transitionalProcessing = false;
  }
  if (values.std3) {
    options.useSTD3ASCIIRules = true;
  }
  if (values["verify-dns-length"]) {
    options.verifyDNSLength = true;
  }
  if (values["check-hyphens"]) {
    options.checkHyphens = true;
  }
  if (values["check-bidi"]) {
    options.checkBidi = true;
  }
  if (values["check-joiners"]) {
    options.checkJoiners = true;
  }
  return options;
}

function convertOne(domainName, mode, options) {
  if (mode === "ascii") {
    return { input: domainName, PC: toAscii(domainName, options) };
  }
  if (mode === "unicode") {
    return { input: domainName, IDN: toUnicode(domainName, options) };
  }
  const idn = toUnicode(domainName, options);
  return { input: domainName, IDN: idn, PC: toAscii(idn, options) };
}

function formatText(result, mode, separator) {
  if (mode === "ascii") {
    return result.PC;
  }
  if (mode === "unicode") {
    return result.IDN;
  }
  return `${result.IDN}${separator}${result.PC}`;
}

function readStdin(stream) {
  return new Promise((resolve, reject) => {
    let data = "";
    stream.setEncoding("utf8");
    stream.on("data", (chunk) => {
      data += chunk;
    });
    stream.on("end", () => resolve(data));
    stream.on("error", reject);
  });
}

async function collectDomainNames(positionals, stdin) {
  if (positionals.length > 0) {
    return positionals;
  }
  if (stdin.isTTY) {
    throw new UsageError("No domain names given.");
  }
  return (await readStdin(stdin))
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

async function run(argv, io) {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      options: OPTIONS,
      allowPositionals: true,
    });
  } catch (error) {
    throw new UsageError(error.message);
  }
  const { values, positionals } = parsed;

  if (values.help) {
    io.stdout.write(USAGE);
    return 0;
  }
  if (values.version) {
    io.stdout.write(`${pkg.version}\n`);
    return 0;
  }

  const mode = values.to.toLowerCase();
  if (!["ascii", "unicode", "both"].includes(mode)) {
    throw new UsageError(
      `Unknown mode "${values.to}", expected one of: ascii, unicode, both.`,
    );
  }

  const options = toTr46Options(values);
  const domainNames = await collectDomainNames(positionals, io.stdin);

  const results = [];
  let failed = false;
  domainNames.forEach((domainName) => {
    try {
      results.push(convertOne(domainName, mode, options));
    } catch (error) {
      failed = true;
      results.push({ input: domainName, error: error.message });
    }
  });

  if (values.json) {
    io.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
  } else {
    results.forEach((result) => {
      if (result.error) {
        io.stderr.write(`${result.error}\n`);
      } else {
        io.stdout.write(`${formatText(result, mode, values.separator)}\n`);
      }
    });
  }

  return failed ? 1 : 0;
}

async function main(argv, io) {
  try {
    return await run(argv, io);
  } catch (error) {
    if (error instanceof UsageError) {
      io.stderr.write(`${error.message}\n\n${USAGE}`);
      return 2;
    }
    throw error;
  }
}

/* c8 ignore start */
// `import.meta.main` rather than comparing import.meta.url against process.argv[1]:
// npm installs the bin as a symlink (node_modules/.bin/idna-uts46-hx -> src/cli.js),
// so argv[1] is the link while import.meta.url is the resolved target. Those never
// match, and the CLI exited silently in every installed tree.
if (import.meta.main) {
  main(process.argv.slice(2), {
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
  }).then((exitCode) => {
    process.exitCode = exitCode;
  });
}
/* c8 ignore stop */

export { main };
