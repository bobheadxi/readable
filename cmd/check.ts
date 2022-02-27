import { Logger } from "log/mod.ts";

import format from "../markdown/format.ts";
import { walkGlobs } from "../lib/walk.ts";
import { diff } from "../lib/diff.ts";

export default async function check(log: Logger, globs: string[]) {
  const results = await walkGlobs(log, globs, format);
  const errors = [];
  for (let [path, content] of results) {
    try {
      if (diff(content.rendered, content.original, { log })) {
        errors.push(`Found unformatted file: '${path}'`);
      } else {
        log.info(`File OK: ${path}`);
      }
    } catch (err) {
      errors.push(err);
    }
  }
  if (errors.length > 0) {
    throw new Error(`check failed:\n${errors}`);
  }
}

export {};
