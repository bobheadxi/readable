# Contributing

## Development

```sh
deno run --unstable --allow-read --allow-write ./readable.ts
```

To install globally:

```sh
deno install --unstable --allow-read --allow-write -f ./readable.ts
readable --help
```

## Tests

Tests should be written in a `{module}.test.ts` file alongside the relevant `{module}.ts`.

To run tests:

```sh
deno test
```
