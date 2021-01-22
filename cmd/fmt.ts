import format from "../markdown/format.ts";
import { walkGlobs } from "../lib/walk.ts";

export default async function fmt(globs: string[], opts: {
  toStdout: boolean;
}) {
  const results = await walkGlobs(globs, format);
  for (let [path, content] of results) {
    if (opts.toStdout) {
      console.log(`%c${path}`, "font-weight:bold");
      console.log(content.rendered);
    } else {
      console.log(path);
      Deno.writeTextFile(path, content.rendered);
    }
  }
}

export {};
