# Contributing

## Development

Readable is built using [Deno](https://deno.land/) and TypeScript.

A dev script (source in [`./util/dev.ts`](./util/dev.ts)) should be used instead of `deno ...` commands.

```sh
./dev readable --help
```

To install globally:

```sh
./dev readable install
readable --help
```

To omit the leading `./` on most platforms, you can create a temporary alias using `alias dev=./dev`

### Tests

Tests should be written in a `{module}.test.ts` file alongside the relevant `{module}.ts`.

To run tests:

```sh
./dev test
```

### Dependencies

In general, dependencies should be exported as a module in [`./deps`](./deps).
If the dependency is a [third-party Remark plugin](https://github.com/remarkjs/remark/blob/main/doc/plugins.md), export it in [`./plugins/thirdparty`](./plugins/thirdparty) instead.

See existing files for examples.
