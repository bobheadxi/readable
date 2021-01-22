import { expandGlob } from "https://deno.land/std@0.83.0/fs/mod.ts";

interface FileContents {
  original: string;
  rendered: string;
  fullPath: string;
}

export async function walkGlobs(
  globs: string[],
  render: (contents: string) => string,
): Promise<Map<string, FileContents>> {
  const results = new Map<string, FileContents>();
  if (globs.length == 0) globs.push("**/*.md");
  for (let glob of globs) {
    console.debug(`processing ${glob}`);
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
