import { cac } from 'https://unpkg.com/cac/mod.ts'

import fmt from "./cmd/fmt.ts";

const cli = cac('readable')
cli.help()
cli.showHelpOnExit = true;

/**
 * readable fmt
 */
cli.command('fmt [...globs]', 'format Markdown')
  .option('--to-stdout', 'output results to stdout instead of modifying files')
  .action(async (globs: string[], opts) => {
    await fmt(globs, opts);
  })

try {
  cli.parse();
} catch (err) {
  console.error(`${err.message}`);
  Deno.exit(1)
}

export {};
