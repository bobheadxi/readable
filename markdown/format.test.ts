import { fail } from "../deps/asserts.ts";
import { outputDiff } from "../lib/diff.ts";

import format from "./format.ts";

// run a simple format with default remark to ensure everything works
const testSuite = "markdown/format";
const input = `---
field: wow
---

# Document

hello world! this is a document.
with a [a link](https://bobheadxi.dev) and **emphasis [bold link](https://github.com/bobheadxi)** and *italics* and ~strike~
and a ![cute image](https://bobheadxi.dev/assets/images/profile.jpg).

and this is another paragraph!

## Math

Lift($L$) can be determined by Lift Coefficient ($C_L$) like the following
equation.

$$
L = \frac{1}{2} \rho v^2 S C_L
$$
`;
const want = `---
field: wow
---

# Document

hello world! this is a document. with a [a link](https://bobheadxi.dev) and **emphasis [bold link](https://github.com/bobheadxi)** and *italics* and ~~strike~~ and a ![cute image](https://bobheadxi.dev/assets/images/profile.jpg).

and this is another paragraph!

## Math

Lift($L$) can be determined by Lift Coefficient ($C_L$) like the following equation.

$$
L = \frac{1}{2} \rho v^2 S C_L
$$
`;

Deno.test({
  name: testSuite,
  fn: () => {
    const got = format(input);
    if (outputDiff(want, got)) {
      fail("Unexpected diff");
    }
  },
});

export {};
