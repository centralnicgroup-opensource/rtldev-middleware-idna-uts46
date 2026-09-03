# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue,
email, or any other method with the owners of this repository before making a change.

Please note we have a code of conduct, please follow it in all your interactions with the project.

## Pull Request Process

Every change goes through a pull request, there are no direct pushes to `master`.

1. Create a branch off `master`, named after what it does, e.g. `feat/cli` or `fix/transitional-detection`.
2. Keep a pull request focused on one topic. Unrelated changes belong in their own pull request.
3. Run the checks locally before you push:

   ```bash
   pnpm install
   pnpm test    # mocha test suite
   pnpm lint    # eslint
   ```

   Formatting is handled by prettier and runs automatically on the staged files via lint-staged.

4. Write your commit messages in the format described below. The release is derived from them, so this is not cosmetic.
5. Open the pull request against `master` and describe what changed, why, and how you verified it.
6. Once a maintainer approves and merges, semantic-release publishes the new version to npm, tags it, updates `HISTORY.md` and creates the github release. Nothing is released by hand.

## Commit Messages

Releases are fully automated with [semantic-release](https://github.com/semantic-release/semantic-release), which derives the next version number from the commit messages that land on `master`. We follow the Angular convention:

```
<type>(<scope>): <short summary>

<optional body>

<optional footer>
```

- **type** — one of the types listed below, lowercase.
- **scope** — optional, the part of the package you touched, e.g. `cli`, `deps`, `toAscii`.
- **short summary** — imperative mood ("add", not "added" or "adds"), no capital first letter, no trailing period.

### Types and their effect on the release

| **Type**   | **Use for**                                          | **Release**           |
| ---------- | ---------------------------------------------------- | --------------------- |
| `feat`     | a new feature                                        | minor (1.2.3 → 1.3.0) |
| `fix`      | a bug fix                                            | patch (1.2.3 → 1.2.4) |
| `perf`     | a change that improves performance                   | patch                 |
| `revert`   | reverting an earlier commit                          | patch                 |
| `docs`     | documentation only                                   | none                  |
| `refactor` | a change that neither fixes a bug nor adds a feature | none                  |
| `test`     | adding or correcting tests                           | none                  |
| `build`    | build system, bundling or dependencies               | none                  |
| `ci`       | CI configuration and workflows                       | none                  |
| `style`    | formatting only, no change in behavior               | none                  |
| `chore`    | maintenance that fits nowhere else                   | none                  |

A type that triggers no release still shows up in the repository history, it just does not produce a new version on its own.

### Breaking changes

Announce a breaking change with a `BREAKING CHANGE:` footer, which triggers a major release:

```
feat(toUnicode): rename the transitional option

BREAKING CHANGE: option `transitional` is now called `transitionalProcessing`.
```

The shorthand `feat!:` does **not** work in this repository. The configured Angular preset does not understand the `!` marker, so such a commit is not recognized at all and triggers no release whatsoever, not even the minor one you would get without the `!`. Always use the footer.

### Examples

```
feat(cli): add a command line interface
fix(toAscii): keep the domain name unchanged when tr46 returns null
perf(convert): skip the mapping of already converted labels
docs: describe the pull request process
chore(deps): refresh node dependencies
```

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
