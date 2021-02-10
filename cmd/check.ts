import format from "../markdown/format.ts";
import { walkGlobs } from "../lib/walk.ts";
import { outputDiff } from "../lib/diff.ts";

export default async function check(globs: string[]) {
  const results = await walkGlobs(globs, format);
  const errors = [];
  for (let [path, content] of results) {
    try {
      if (outputDiff(content.rendered, content.original)) {
        errors.push(`Found unformatted file: '${path}'`);
      } else {
        console.log(`File OK: ${path}`);
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
