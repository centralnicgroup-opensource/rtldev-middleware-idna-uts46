import { copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import bundleSize from "rollup-plugin-bundle-size";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

// The declarations are hand-written (src/index.d.ts) because the implementation is
// JavaScript — nothing emits them. Copying them beside the bundles is what makes the
// published tarball agree with the `typings` field in package.json, which 6.2.0 and
// 6.2.1 did not. It runs once per output; all three write the same file into dist.
// (RSRMID-3085)
const declarations = () => ({
  name: "copy-declarations",
  writeBundle({ file }) {
    copyFileSync("src/index.d.ts", join(dirname(file), "index.d.ts"));
  },
});

export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/index.bundle.js",
      format: "iife",
      name: "idnaUts46",
    },
    {
      file: "dist/index.cjs",
      format: "cjs",
    },
    {
      file: "dist/index.mjs",
      format: "es",
    },
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    json(),
    terser(),
    bundleSize(),
    declarations(),
  ],
};
