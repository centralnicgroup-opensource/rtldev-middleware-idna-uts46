#!/usr/bin/env node
// Fails when the tarball npm would publish is missing a file package.json advertises.
//
// This exists because 6.2.0 and 6.2.1 shipped without dist/index.d.ts while still
// declaring `typings`, and nothing noticed: the package.json was right, the build was
// green, and every TypeScript consumer broke at `tsc` time. Nothing in the publish path
// disagreed with itself, so the check has to be the thing that compares the two.
// (RSRMID-3085)
//
// The expected paths are read from package.json rather than listed here, so a new entry
// point is covered the day it is declared instead of the day someone remembers this
// file. That includes `exports`: adopting an exports map and retiring `main`/`typings`
// is the obvious next change to this package, and a guard that only knew the legacy
// fields would switch itself off exactly then, still printing a pass.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

// `./dist/index.mjs` and `dist/index.mjs` are the same entry; npm reports the latter.
const normalise = (path) => path.replace(/^\.\//, "");

// An exports map nests conditions and subpaths arbitrarily deep, so every string leaf
// naming a file in the package counts. Leaves that are not relative specifiers (`false`
// to block a subpath, a bare package name) name nothing to pack.
const exported = (node) => {
  if (typeof node === "string") {
    return node.startsWith("./") ? [node] : [];
  }
  if (Array.isArray(node)) {
    return node.flatMap(exported);
  }
  if (node !== null && typeof node === "object") {
    return Object.values(node).flatMap(exported);
  }
  return [];
};

const advertised = new Map();
for (const [field, path] of [
  ["main", pkg.main],
  ["module", pkg.module],
  ["types", pkg.types],
  ["typings", pkg.typings],
  ...Object.entries(pkg.bin ?? {}).map(([name, path]) => [`bin.${name}`, path]),
  ...exported(pkg.exports).map((path) => ["exports", path]),
]) {
  // First field wins the label: one file named twice is still one thing to check.
  if (typeof path === "string" && path.length > 0) {
    const key = normalise(path);
    if (!advertised.has(key)) {
      advertised.set(key, field);
    }
  }
}

// npm, not pnpm, because @semantic-release/npm publishes by shelling out to
// `npm publish` — so npm's packlist is the one that decides what ships, and any other
// packer would be measuring something the registry never sees.
//
// --ignore-scripts so that what is inspected is the working tree as the build left it.
// Letting `prepack`/`prepare` run here would rebuild dist, which would hide exactly the
// failure this guards against: a tarball assembled from a tree the build never produced.
// (`npm publish` does re-run `prepare`, so the published tarball is a rebuild of this
// tree rather than this tree — a rebuild that fails takes the publish down with it.)
//
// --loglevel=error because npm is not the package manager this repository declares, so
// every run would otherwise print a devEngines warning about being run at all. Errors
// still reach the terminal, and a non-zero exit still throws here.
const output = execFileSync(
  "npm",
  ["pack", "--dry-run", "--json", "--ignore-scripts", "--loglevel=error"],
  { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
);

// npm 12 reports an object keyed by package name; npm 11 and earlier an array. Accept
// both, so this does not start failing on the next major of the toolchain.
const report = JSON.parse(output);
const tarballs = Array.isArray(report) ? report : Object.values(report);

const packed = new Set(
  tarballs
    .flatMap((tarball) => tarball.files ?? [])
    .map((entry) => normalise(entry.path)),
);

const missing = [...advertised].filter(([path]) => !packed.has(path));

if (missing.length > 0) {
  console.error(
    `${pkg.name}@${pkg.version}: the pack output is missing ${missing.length} file(s) package.json advertises:`,
  );
  for (const [path, field] of missing) {
    console.error(`  ${field}: ${path}`);
  }
  console.error(
    "Run `pnpm run build` and check that nothing removes the file afterwards. Publishing this tree would break every consumer of the missing entry point.",
  );
  process.exit(1);
}

console.log(
  `${pkg.name}@${pkg.version}: ${advertised.size} advertised file(s) present in the pack output (${packed.size} files total).`,
);
