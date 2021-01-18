import format from "../markdown/format.ts";
import { expandGlob } from "https://deno.land/std@0.83.0/fs/mod.ts";

export default async function fmt(globs: string[], opts: {
  toStdout: boolean,
}) {
  if (globs.length == 0) globs.push("**/*.md")
  for (let glob of globs) {
    console.debug(`processing ${glob}`)

    // generate formatted content
    const results = new Map<string, string>();
    for await (const file of expandGlob(glob)) {
      if (file.isDirectory || file.isSymlink) continue;
      try {
        const contents = await Deno.readTextFile(file.path);
        results.set(file.path, format(contents.toString()));
      } catch (err) {
        throw new Error(`failed to format '${file.path}', aborting: ${err}`);
      }
    }
  
    // if successful formatting all files, write results
    for (let [path, content] of results) {
      if (opts.toStdout) {
        console.log(`${path}`)
        console.log(content)
      } else {
        Deno.writeTextFile(path, content);
      }
    }
  }
}

export {};
