import format from "./markdown/format.ts";

import { fixture1 } from "./test/fixtures.ts";

const formatted = format(fixture1);
console.log(formatted);

export {};
