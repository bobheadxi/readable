import format from "./markdown/format.ts";

import fixtures from "./test/fixtures.ts";

const formatted = format(fixtures[Deno.args[0]]);
console.log(formatted);

export {};
