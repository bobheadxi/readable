import { fail } from "testing/asserts.ts";
import { getLogger } from "log/mod.ts";

import format from "../../markdown/format.ts";
import remark from "../../lib/remark.ts";
import { diff } from "../../lib/diff.ts";

import reflow from "./reflow.ts";
import { lorenIpsumLines, lorenIpsumText, TestSuite } from "../../lib/test.ts";

// e2e tests just run a format
{
  const testRemark = remark.use(reflow);
  new TestSuite<string, string>(
    "plugins/readable/reflow:e2e",
    (testCase) => {
      const got = format(testCase.input, testRemark);
      if (diff(testCase.expect, got, { log: getLogger() })) {
        fail("Unexpected diff");
      }
    },
    [
      {
        case: "should split Lorem Ipsum",
        input: lorenIpsumText(),
        expect: lorenIpsumLines().join("\n") + "\n",
      },
      {
        case: "break sentences that start or end with an unbreakable node",
        input: `${
          lorenIpsumLines()[0]
        } [now here is a link](https://bobheadxi.dev) in a rather long sentence, ${
          lorenIpsumLines()[1]
        } \`And then some inline code\` in another sentence.`,
        expect: `${lorenIpsumLines()[0]}
[now here is a link](https://bobheadxi.dev) in a rather long sentence, ${
          lorenIpsumLines()[1]
        }
\`And then some inline code\` in another sentence.
`,
      },
      {
        case: "short sentence followed by long sentence should be broken",
        input: `# Document

A short \`sentence\`! This next sentence is long, with [a link](https://bobheadxi.dev) and **emphasis** and *italics* and ~~strike~~ and a ![cute image](https://bobheadxi.dev/assets/images/profile.jpg).`,
        expect: `# Document

A short \`sentence\`!
This next sentence is long, with [a link](https://bobheadxi.dev) and **emphasis** and *italics* and ~~strike~~ and a ![cute image](https://bobheadxi.dev/assets/images/profile.jpg).
`,
      },
      {
        case: "short sentence followed by short sentence should be merged",
        input: `# Document

A short \`sentence\`!
And another one.`,
        expect: `# Document

A short \`sentence\`! And another one.
`,
      },
      {
        case: "short sentence followed by long sentence should be broken",
        input: `# Document

A short \`sentence\`! This next sentence is long, with [a link](https://bobheadxi.dev) and **emphasis** and *italics* and ~~strike~~ and a ![cute image](https://bobheadxi.dev/assets/images/profile.jpg).`,
        expect: `# Document

A short \`sentence\`!
This next sentence is long, with [a link](https://bobheadxi.dev) and **emphasis** and *italics* and ~~strike~~ and a ![cute image](https://bobheadxi.dev/assets/images/profile.jpg).
`,
      },
      {
        case: "handle trailing punctuation after unbreakable",
        input:
          `This is a sentence with a trailing period [after an unbreakable node]().

The next sentence is here.`,
        expect:
          `This is a sentence with a trailing period [after an unbreakable node]().

The next sentence is here.
`,
      },
      {
        case: "handle multi-line link",
        input: `[Instructions for allocating a fresh diagnostic
        code can be found here.](./diagnostics/diagnostic-codes.md)`,
        expect:
          "[Instructions for allocating a fresh diagnostic code can be found here.](./diagnostics/diagnostic-codes.md)\n",
      },
    ],
  );
}

export {};
