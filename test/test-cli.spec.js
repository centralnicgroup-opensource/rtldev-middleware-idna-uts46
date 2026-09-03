'use strict';

import assert from 'assert';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { main } from '../src/cli.js';

const CLI = fileURLToPath(new URL('../src/cli.js', import.meta.url));

function collector() {
  const chunks = [];
  return {
    write(chunk) {
      chunks.push(chunk);
      return true;
    },
    get text() {
      return chunks.join('');
    },
  };
}

async function cli(args, stdin = null) {
  const stdout = collector();
  const stderr = collector();
  const code = await main(args, {
    stdin: stdin === null ? { isTTY: true } : Readable.from([stdin]),
    stdout,
    stderr,
  });
  return { code, stdout: stdout.text, stderr: stderr.text };
}

suite('cli', function () {
  test('converts to both representations by default', async function () {
    const result = await cli(['öbb.at', 'xn----5da7e.de']);
    assert.strict.equal(result.code, 0);
    assert.strict.equal(
      result.stdout,
      'öbb.at\txn--bb-eka.at\nä-ü.de\txn----zfa7e.de\n',
    );
    assert.strict.equal(result.stderr, '');
  });

  test('honors the custom separator', async function () {
    const result = await cli(['--separator', ' => ', 'öbb.at']);
    assert.strict.equal(result.stdout, 'öbb.at => xn--bb-eka.at\n');
  });

  test('converts to ascii only', async function () {
    const result = await cli(['--to', 'ascii', 'öbb.at']);
    assert.strict.equal(result.code, 0);
    assert.strict.equal(result.stdout, 'xn--bb-eka.at\n');
  });

  test('converts to unicode only', async function () {
    const result = await cli(['-t', 'UNICODE', 'xn--bb-eka.at']);
    assert.strict.equal(result.code, 0);
    assert.strict.equal(result.stdout, 'öbb.at\n');
  });

  test('applies transitional processing switches', async function () {
    assert.strict.equal(
      (await cli(['-t', 'ascii', '--transitional', 'faß.de'])).stdout,
      'fass.de\n',
    );
    assert.strict.equal(
      (await cli(['-t', 'ascii', '--no-transitional', 'faß.de'])).stdout,
      'xn--fa-hia.de\n',
    );
  });

  test('passes tr46 flags through', async function () {
    const result = await cli([
      '-t',
      'ascii',
      '--std3',
      '--verify-dns-length',
      '--check-hyphens',
      '--check-bidi',
      '--check-joiners',
      'öbb.at',
    ]);
    assert.strict.equal(result.code, 0);
    assert.strict.equal(result.stdout, 'xn--bb-eka.at\n');
  });

  test('reads domain names from stdin', async function () {
    const result = await cli(['-t', 'ascii'], 'öbb.at\n\n  faß.de  \r\n');
    assert.strict.equal(result.code, 0);
    assert.strict.equal(result.stdout, 'xn--bb-eka.at\nxn--fa-hia.de\n');
  });

  test('emits json', async function () {
    const result = await cli(['--json', 'öbb.at']);
    assert.strict.deepEqual(JSON.parse(result.stdout), [
      { input: 'öbb.at', IDN: 'öbb.at', PC: 'xn--bb-eka.at' },
    ]);
  });

  test('reports conversion failures and exits with 1', async function () {
    const invalid = String.fromCodePoint(0xd0000);
    const result = await cli([invalid, 'öbb.at']);
    assert.strict.equal(result.code, 1);
    assert.strict.equal(result.stdout, 'öbb.at\txn--bb-eka.at\n');
    assert.strict.match(result.stderr, /Unable to translate/);
  });

  test('reports conversion failures in json mode', async function () {
    const invalid = String.fromCodePoint(0xd0000);
    const result = await cli(['--json', invalid]);
    assert.strict.equal(result.code, 1);
    const parsed = JSON.parse(result.stdout);
    assert.strict.equal(parsed[0].input, invalid);
    assert.strict.match(parsed[0].error, /Unable to translate/);
  });

  test('rejects an unknown mode', async function () {
    const result = await cli(['--to', 'klingon', 'öbb.at']);
    assert.strict.equal(result.code, 2);
    assert.strict.equal(result.stdout, '');
    assert.strict.match(result.stderr, /Unknown mode "klingon"/);
  });

  test('rejects an unknown option', async function () {
    const result = await cli(['--nope']);
    assert.strict.equal(result.code, 2);
    assert.strict.match(result.stderr, /Usage:/);
  });

  test('rejects contradicting transitional switches', async function () {
    const result = await cli(['--transitional', '--no-transitional', 'öbb.at']);
    assert.strict.equal(result.code, 2);
    assert.strict.match(result.stderr, /mutually exclusive/);
  });

  test('rejects a missing domain name on a tty', async function () {
    const result = await cli([]);
    assert.strict.equal(result.code, 2);
    assert.strict.match(result.stderr, /No domain names given/);
  });

  test('prints help and version', async function () {
    const help = await cli(['--help']);
    assert.strict.equal(help.code, 0);
    assert.strict.match(help.stdout, /^Usage: idna-uts46-hx/);

    const version = await cli(['--version']);
    assert.strict.equal(version.code, 0);
    assert.strict.match(version.stdout, /^\d+\.\d+\.\d+/);
  });

  test('runs as an executable script', function () {
    const result = spawnSync(process.execPath, [CLI, '-t', 'ascii', 'öbb.at'], {
      encoding: 'utf8',
    });
    assert.strict.equal(result.status, 0);
    assert.strict.equal(result.stdout, 'xn--bb-eka.at\n');
  });

  // npm installs the bin as a symlink in node_modules/.bin, so the path the CLI is
  // invoked through is not the path the module resolves to. Detecting "am I the entry
  // point?" by comparing process.argv[1] against import.meta.url therefore answered no
  // in every installed tree, and the CLI exited silently. Invoke it through a symlink
  // the way npm does.
  test('runs when invoked through a symlink, as npm installs the bin', function () {
    const dir = mkdtempSync(join(tmpdir(), 'idna-uts46-cli-'));
    try {
      const link = join(dir, 'idna-uts46-hx');
      symlinkSync(CLI, link);
      const result = spawnSync(
        process.execPath,
        [link, '-t', 'ascii', 'öbb.at'],
        { encoding: 'utf8' },
      );
      assert.strict.equal(result.status, 0);
      assert.strict.equal(result.stdout, 'xn--bb-eka.at\n');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
