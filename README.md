# Readable ![pipeline](https://github.com/bobheadxi/readable/workflows/pipeline/badge.svg) [![codecov](https://codecov.io/gh/bobheadxi/readable/branch/main/graph/badge.svg?token=NwwQxKVsbt)](https://codecov.io/gh/bobheadxi/readable)

Opinionated Markdown formatter, featuring [semantic line breaks](#semantic-line-breaks).

## Usage

Using [Deno](https://deno.land):

```sh
deno install --allow-read --allow-write https://deno.land/x/readable/readable.ts
readable -h
```

Using [Docker](https://www.docker.com/):

```sh
docker run -v $(pwd):/data ghcr.io/bobheadxi/readable
```

Using [pre-commit](https://pre-commit.com/) by adding to `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/bobheadxi/readable
    rev: main
    hooks:
      - id: readable
```

## Features

Readable supports basic formatting and validation of formatting with `readable fmt` and `readable check`.
For example:

```sh
readable fmt **/*.md
```

Readable's formatting performs:

- [Semantic line breaks](#semantic-line-breaks).
- Simple, zero-config, standardized formatting for Markdown elements, generally provided by [`remark-stringify`](https://github.com/remarkjs/remark/tree/main/packages/remark-stringify).
- Support for common extensions (Frontmatter and GitHub Markdown).

## Semantic line breaks

In general, Markdown files are written with lines breaks at some arbitrary character column (such as 80 characters), or are written with entire paragraphs on a single line.
Both these approaches have significant issues:

- Line-breaking at some arbitrary character column looks nice when viewed, but is easily lost when making and suggesting edits, necessitating reflowing entire paragraphs.
  This leads to incomprehensible or uninformative diffs that are difficult to review.
- Writing entire paragraphs on single lines is reasonably readable nowadays due to most editors and viewers performing wrapping out-of-the-box, but they make suggestions and diffs difficult to review due to every single change causing a diff on entire paragraphs.

Readable performs a variant of [semantic line breaks](https://sembr.org/) that attempts to strike a balance between:

- Making use of how most Markdown specifications ignore single new lines to still provide a good **rendered Markdown** experience.
- Leveraging modern line-wrapping in most viewers to maintain a good **raw Markdown** experience.
- Maintaining understandable diffs in Markdown documentation for a good **reviewing** experience.

In general, Readable's semantic line breaks follows these rules:

- A *semantic boundary* is defined to be the end of a sentence.
- Allow multiple short sentences to be part of a single line, up to a character threshold.
- After a character threshold, a semantic boundary should be followed by a line break.

This means that changes now reflect changes to *ideas* within semantic boundaries, and more accurately reflect the idea being changed.

### Rationale

A blog post detailing the idea behind this project is available here:
[Semantic Line Breaks](https://bobheadxi.dev/semantic-line-breaks/). A condensed example of the benefits of such a system is outlined here.

For example, consider the following text, where we want to change `incididunt` with `oh I am so hungry`:

```text
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
```

If the text was broken at a character column, the diff might look like:

```diff
- Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
+ Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor oh I am
- ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
+ so hungry ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
- ullamco laboris nisi ut aliquip ex ea commodo consequat.
+ exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
```

This can be rather incomprehensible.
If the text was not broken at all, the diff would look like:

```diff
- Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
+ Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor oh I am so hungry ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
```

This is a bit better, but it can still be a difficult to figure out what has changed.

With semantic line breaks, this change might look like this:

```diff
- Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
+ Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor oh I am so hungry ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
```

In this diff, it is immediately clear what *idea* has changed, as encapsulated by the sentence it belongs in.
This makes it easier to understand a change being made and reason about it.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development documentation.
