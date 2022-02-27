import { Logger } from "log/mod.ts";
import format from "../markdown/format.ts";
import { walkGlobs } from "../lib/walk.ts";

export type FmtOptions = {
  toStdout: boolean;
};

export default async function fmt(
  log: Logger,
  globs: string[],
  opts: FmtOptions,
) {
  const results = await walkGlobs(log, globs, format);
  for (let [path, content] of results) {
    if (opts.toStdout) {
      log.info(`%c${path}`, "font-weight:bold");
      log.info(content.rendered);
    } else {
      log.info(path);
      Deno.writeTextFile(content.fullPath, content.rendered);
    }
  }
}

export {};
