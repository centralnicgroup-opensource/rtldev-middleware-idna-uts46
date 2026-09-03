# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue,
email, or any other method with the owners of this repository before making a change.

Please note we have a code of conduct, please follow it in all your interactions with the project.

## Development

The repository ships a devcontainer, so **Reopen in Container** is the supported
setup — it brings the toolchain and the linters. Working outside it is possible but
unsupported, and version skew against CI is on you.

Run the repository's lint and test scripts before opening a pull request. The shared
CI workflows run the same ones, so a green local run is a green build:

```bash
pnpm install
pnpm test    # mocha test suite
pnpm lint    # eslint
```

## Commit messages

[Conventional Commits](https://www.conventionalcommits.org/) with a **mandatory
scope**:

```text
<type>(<scope>): <summary>
```

- **type** — one of the types in the table below, lowercase.
- **scope** — the part of the package you touched, e.g. `cli`, `deps`, `toAscii`.
- **summary** — imperative mood ("add", not "added" or "adds"), no capital first
  letter, no trailing period.

Releases are fully automated with
[semantic-release](https://github.com/semantic-release/semantic-release), which
derives the next version number from the commits that land on `main`. The type
decides whether there is a release at all, and which one:

| Type       | Use for                                         | Release   |
| ---------- | ----------------------------------------------- | --------- |
| `fix`      | a bug fix in the source                         | **patch** |
| `feat`     | a feature in the source                         | **minor** |
| `perf`     | a performance improvement in the source         | **patch** |
| `revert`   | reverting an earlier commit                     | **patch** |
| `ci`       | workflows, devcontainer                         | none      |
| `build`    | build tooling and scripts                       | none      |
| `docs`     | documentation only                              | none      |
| `test`     | tests only                                      | none      |
| `refactor` | internal restructuring with no behaviour change | none      |
| `style`    | formatting only, no change in behaviour         | none      |
| `chore`    | anything else                                   | none      |

`fix`, `feat` and `perf` are reserved for changes to the source, because they
trigger a release. Everything else takes a non-releasing type. A non-releasing
commit still lands in the history, it just does not cut a version on its own.

### Breaking changes

A breaking change adds a `BREAKING CHANGE: <summary>` line to the commit body, after
a blank line. It triggers a major bump **regardless of the type** — a `docs` or
`chore` commit carrying that footer releases a major just as a `feat` does — so it
also needs a migration note for consumers in the same change.

```text
feat(toUnicode): rename the transitional option

BREAKING CHANGE: option `transitional` is now called `transitionalProcessing`.
```

Two things that look like they should work but do not, because the configured
Angular preset only recognises the literal `BREAKING CHANGE` keyword and does not
set a breaking-header pattern:

- **`feat(cli)!: …` releases nothing at all.** The `!` makes the header unparseable,
  so the commit is dropped entirely — you lose even the minor bump you would have
  got without it. Use the footer.
- **`BREAKING-CHANGE:` and `BREAKING CHANGES:` are not recognised** either. Only
  `BREAKING CHANGE` matches, in any capitalisation.

Do **not** add `Co-Authored-By:` trailers.

## Branches and pull requests

Every change goes through a pull request, there are no direct pushes to `main`.

- Branch from an up-to-date default branch: run `git checkout main` and
  `git pull --ff-only` before `git checkout -b`. Never branch from a stale local
  `main` or from another feature branch.
- Name branches after the Jira issue: `RSRMID-1234/short-description`.
- Keep a pull request focused on one topic. Unrelated changes belong in their own
  pull request.
- Include the Jira issue link in the PR description, and add the PR URL as a comment
  on the Jira issue after opening it.
- **Rebase-merge** (`gh pr merge --rebase`). Squash merges are disabled at the
  repository level, because the release tooling reads the individual commits.

Once a pull request is merged, semantic-release publishes the new version to npm,
tags it, updates `HISTORY.md` and creates the github release. Nothing is released by
hand.

## Formatting

Prettier owns everything it understands (Markdown, JSON, YAML). The husky pre-commit
hook runs `lint-staged` over what you staged, so in practice formatting is fixed
before it reaches CI. `pnpm install` installs the hook, through the `prepare` script.
The hook is skipped when `CI=true`, so semantic-release's own commits are left alone.

Eslint runs in CI via `pnpm run lint`.

## Code of Conduct

### Our Pledge

In the interest of fostering an open and welcoming environment, we as
contributors and maintainers pledge to making participation in our project and
our community a harassment-free experience for everyone, regardless of age, body
size, disability, ethnicity, gender identity and expression, level of experience,
nationality, personal appearance, race, religion, or sexual identity and
orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment
include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior by participants include:

- The use of sexualized language or imagery and unwelcome sexual attention or
  advances
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information, such as a physical or electronic
  address, without explicit permission
- Other conduct which could reasonably be considered inappropriate in a
  professional setting

### Our Responsibilities

Project maintainers are responsible for clarifying the standards of acceptable
behavior and are expected to take appropriate and fair corrective action in
response to any instances of unacceptable behavior.

Project maintainers have the right and responsibility to remove, edit, or
reject comments, commits, code, wiki edits, issues, and other contributions
that are not aligned to this Code of Conduct, or to ban temporarily or
permanently any contributor for other behaviors that they deem inappropriate,
threatening, offensive, or harmful.

### Scope

This Code of Conduct applies both within project spaces and in public spaces
when an individual is representing the project or its community. Examples of
representing a project or community include using an official project e-mail
address, posting via an official social media account, or acting as an appointed
representative at an online or offline event. Representation of a project may be
further defined and clarified by project maintainers.

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported by contacting the project team. All complaints will be reviewed and
investigated and will result in a response that is deemed necessary and appropriate
to the circumstances. The project team is obligated to maintain confidentiality
with regard to the reporter of an incident. Further details of specific enforcement
policies may be posted separately.

Project maintainers who do not follow or enforce the Code of Conduct in good
faith may face temporary or permanent repercussions as determined by other
members of the project's leadership.

### Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage], version 1.4,
available at [http://contributor-covenant.org/version/1/4][version]

[homepage]: http://contributor-covenant.org
[version]: http://contributor-covenant.org/version/1/4/
