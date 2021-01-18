import format from "./markdown/format.ts";

const path = Deno.args[0]

const f = await Deno.readTextFile(path)
const formatted = format(f.toString())

Deno.writeTextFile(path, formatted)

export {};
