import format from "../markdown/format.ts";
import { walkGlobs } from "../lib/walk.ts";
import { assertEquals } from "../deps/asserts.ts";

export default async function check(globs: string[]) {
  const results = await walkGlobs(globs, format);
  const errors = [];
  for (let [path, content] of results) {
    // POC using built-in assert library, maybe a nicer diffing library?
    try {
      console.log(path);
      assertEquals<string>(content.original, content.rendered);
    } catch (err) {
      errors.push(err);
    }
  }
  if (errors.length > 0) {
    throw new Error(`check failed:\n${errors}`);
  }
}

export {};
