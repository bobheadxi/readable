import { READABLE_VERSION } from "./version.ts";

import { cac } from "./deps/cac.ts";

import check from "./cmd/check.ts";
import fmt from "./cmd/fmt.ts";

const cli = cac("readable");

cli.version(READABLE_VERSION);

/**
 * readable fmt
 */
cli.command("fmt [...globs]", "Format Markdown")
  .option("--to-stdout", "Output results to stdout instead of modifying files")
  .action(async (globs: string[], opts: any) => {
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
 * Show help message on -h and --help flags
 */
cli.help();

/**
 * Run input commands if run as a script.
 * 
 * See https://deno.land/manual@master/tools/script_installer
 */
if (import.meta.main) {
  // Show help if no args are provided
  if (Deno.args.length == 0) {
    cli.outputHelp();
    Deno.exit(1);
  }

  try {
    cli.parse();
  } catch (err) {
    console.error(`${err.message}`);
    Deno.exit(1);
  }
}

export default cli;
