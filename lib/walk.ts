import { expandGlob } from "fs/mod.ts";
import { Logger } from "log/mod.ts";

interface FileContents {
  original: string;
  rendered: string;
  fullPath: string;
}

const DEFAULT_GLOB = "**/*.md";

export async function walkGlobs(
  log: Logger,
  globs: string[],
  render: (contents: string) => string,
): Promise<Map<string, FileContents>> {
  // Set default globs
  if (globs.length == 0) globs.push(DEFAULT_GLOB);

  // Process globs
  const results = new Map<string, FileContents>();
  for (let glob of globs) {
    log.debug(`processing ${glob}`);
    for await (const file of expandGlob(glob)) {
      if (file.isDirectory || file.isSymlink) continue;
      try {
        const contents = await Deno.readTextFile(file.path);
        const contentsStr = contents.toString();
        results.set(file.path.replace(Deno.cwd(), ""), {
          original: contentsStr,
          rendered: render(contentsStr),
          fullPath: file.path,
        });
      } catch (err) {
        throw new Error(`failed to render '${file.path}', aborting: ${err}`);
      }
    }
  }
  return results;
}
