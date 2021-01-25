import { cac } from "./deps/cac.ts";
import check from "./cmd/check.ts";

import fmt from "./cmd/fmt.ts";

const cli = cac("readable");
/**
 * readable fmt
 */
cli.command("fmt [...globs]", "Format Markdown")
  .option("--to-stdout", "Output results to stdout instead of modifying files")
  .action(async (globs: string[], opts) => {
    console.debug("fmt");
    await fmt(globs, opts);
  });

/**
 * readable check
 */
cli.command("check [...globs]", "Check Markdown formatting")
  .action(async (globs: string[]) => {
    console.debug("check");
    await check(globs);
  });

/**
 * Show help if no args are provided, or on help flags, or on exit (?)
 */
cli.help();
if (Deno.args.length == 0) {
  cli.outputHelp();
  Deno.exit(1);
}

/**
 * Run input commands
 */
try {
  cli.parse();
} catch (err) {
  console.error(`${err.message}`);
  Deno.exit(1);
}

export {};
