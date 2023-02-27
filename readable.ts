import { cac } from "cac/mod.ts";
import { processArgs } from "cac/deno/deno.ts";
import { getLogger } from "log/mod.ts";

import { READABLE_VERSION } from "./version.ts";
import check from "./cmd/check.ts";
import fmt, { FmtOptions } from "./cmd/fmt.ts";
import setupLogger from "./lib/setupLogger.ts";

const cli = cac("readable")
  .version(READABLE_VERSION)
  .help()
  .option("--log-level <level>", "Set a log level", { default: "INFO" });

/**
 * readable fmt
 */
cli
  .command("fmt [...globs]", "Format Markdown")
  .option("--to-stdout", "Output results to stdout instead of modifying files")
  .action(async (globs: string[], opts: FmtOptions) => {
    const log = getLogger("fmt");
    await fmt(log, globs, opts);
  });

/**
 * readable check
 */
cli
  .command("check [...globs]", "Check Markdown formatting")
  .action(async (globs: string[]) => {
    const log = getLogger("check");
    await check(log, globs);
  });

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
    const parsed = cli.parse(processArgs, { run: false });
    await setupLogger(parsed.options.logLevel);
    await cli.runMatchedCommand();
  } catch (err) {
    getLogger().error(`${err.message}`);
    Deno.exit(1);
  }
}

export default cli;
