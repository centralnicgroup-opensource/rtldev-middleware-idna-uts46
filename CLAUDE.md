# Project Instructions

## Project Overview

JavaScript library and CLI converting domain names between IDN and Punycode with UTS #46
(TR46) processing, built on the `tr46` npm package.

- **Language / runtime:** JavaScript (ES modules, `"type": "module"`), Node
- **Package name:** `idna-uts46-hx` (npm; CLI executable of the same name, `src/cli.js`)
- **Default branch:** `main`

## Architecture

- **`transitionalProcessing` is derived from the TLD** in `src/index.js` (`getDefaultOptions`):
  off for `.art .be .ca .de .swiss .fr .pm .re .tf .wf .yt`, on otherwise. An explicit
  caller option overrides it; the CLI's `--transitional` / `--no-transitional` set it.
- **Type declarations are hand-written in `src/index.d.ts`.** Nothing generates them — a
  change to the public surface is not finished until that file matches it.
- **`dist/index.d.ts` is a build artifact** copied by `rollup-esm.config.mjs`, where the
  `types`/`typings` fields point. Never commit it or add it to the `@semantic-release/git`
  assets.
- **The three bundles in `dist/` are committed by the release** (`.releaserc.json` assets),
  although `dist/` is git-ignored — never hand-edit or commit them.

## Coding Standards

- **Lint:** ESLint recommended rules, config `eslint.config.cjs` (ES2022, mocha globals for
  `test/*.js`).
- **Formatting:** prettier defaults (no config file); the husky pre-commit hook runs
  `lint-staged`, skipped when `CI=true`.
- `HISTORY.md` is in `.prettierignore` — it is owned by semantic-release; leave it unformatted.

## Testing

- **Framework:** mocha, `tdd` UI (`suite`/`test`), config `.mocharc.yml` (`bail`,
  `check-leaks`); specs are `test/*.spec.js`.
- `pnpm test` runs `prepare` first (husky + rollup build) and `verify:pack` after —
  `tools/verify-pack.mjs` fails if the npm tarball lacks a file `package.json` advertises.

### Running tests

```sh
pnpm test             # build, mocha, verify:pack
pnpm lint             # eslint
pnpm prettier         # formatting check; pnpm prettier:fix rewrites
pnpm test:coverage    # c8 HTML report; posttest:coverage then serves it with vite on port 8080 and does not return
```

## Build, CI & Policies

- **CI:** `pr.yml` is the single pull-request entry point — it calls `quality.yml`
  (prettier, actionlint, shellcheck) and the shared `idna-uts46-test.yml` from
  [rtldev-middleware-shareable-workflows](https://github.com/centralnicgroup-opensource/rtldev-middleware-shareable-workflows),
  then gates on the `PR: completed` job. Do not reimplement shared workflows here.
- **Releases:** shared `idna-uts46-release.yml` on push to `main`; semantic-release
  (`.releaserc.json`) publishes to npm, writes `HISTORY.md` and commits it back.
- **Build:** `pnpm run build` (rollup, `rollup-esm.config.mjs`) emits `dist/index.mjs`,
  `dist/index.cjs` and the IIFE `dist/index.bundle.js`.
- **Lockfiles:** `pnpm-lock.yaml` is committed deliberately; `package-lock.json` and
  `yarn.lock` are git-ignored — pnpm only.
- **Supply chain:** `minimumReleaseAge: 1440` in `pnpm-workspace.yaml` is enforced
  workspace-wide — wait out a red build rather than lowering it.
- **Devcontainer:** the frame is in `.devcontainer/`; the shared behaviour comes from the
  `devbase` devcontainer Feature (`devbase:2`). Never fork its scripts into this repository.
- **Runtime version policy:** `engines.node` `^24.15.0 || ^26.0.0` and
  `devEngines.packageManager` pnpm `^11.0.0` in `package.json`.

## Git Conventions

- **Commit messages:** Conventional Commits with **mandatory scope** —
  `<type>(<scope>): <summary>`. Never append a `Co-Authored-By:` trailer.
- **Commit type selection:** `fix`/`feat`/`perf` are reserved for source changes — they
  trigger a release. Everything else uses a non-releasing type: `ci` (workflows,
  devcontainer), `build` (build tooling), `chore`, `docs`, `test`, `refactor`, `style`.
- **Breaking changes:** add `BREAKING CHANGE: <summary>` to the commit body after a blank
  line, and document the consumer upgrade path in the same change. `feat(x)!:` releases
  nothing — the preset does not parse `!`.
- **Branch creation:** before creating a branch, and again after any PR merges,
  run `git checkout main && git pull --ff-only` first — it brings in the merged
  commits and their release tags. Never branch from a stale local `main`, from
  `origin/main` (it becomes the new branch's upstream) or from another feature
  branch.
- **Branch naming:** prefix with the Jira issue ID — `RSRMID-1234-short-description`.
- **Pull requests:** include the Jira issue link in the description; after opening, add the
  PR URL as a comment on the Jira issue.
- **Merging:** rebase-merge (`gh pr merge --rebase`). Squash merges are disabled at the
  repository level.

## Atlassian / JIRA

Work is tracked in **Jira Cloud**, project `RSRMID` — not GitHub Issues. Load the
`jira-conventions` skill before creating, editing or transitioning an issue: it carries the
required fields, this repository's title prefix and component, and the worklog rule for Done and Cancelled.

Two of its rules apply whether or not the skill is loaded:

- Write every Jira issue key as a link to the issue, never bare:
  `[RSRMID-1234](https://centralnic.atlassian.net/browse/RSRMID-1234)`.
  Branch names and commit messages keep the bare key.
- Once an issue's last pull request has merged and its worklog is in, close it
  without asking if nothing is left — the skill lists what counts.

## Do NOT

- Add dependencies without explicit request
- Add `Co-Authored-By:` trailers to commit messages
- Fork the `devbase` devcontainer Feature's scripts into this repository
- Hand-edit `HISTORY.md` or the committed `dist/` bundles — the release owns them
- Change the public API without updating `src/index.d.ts` in the same change
