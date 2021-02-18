import { fail } from "../../deps/asserts.ts";
import remark from "../../deps/remark.ts";
import format from "../../markdown/format.ts";
import { outputDiff } from "../../lib/diff.ts";

import reflow from "./reflow.ts";
import { testSuite } from "../../lib/test.ts";

// e2e tests just run a format
{
  const testRemark = remark.use(reflow);
  testSuite<string, string>("plugins/readable/reflow:e2e", (testCase) => {
    const got = format(testCase.input, testRemark);
    if (outputDiff(testCase.expect, got)) {
      fail("Unexpected diff");
    }
  }, [
    {
      name: "should split Lorem Ipsum",
      input:
        `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
      expect:
        `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
`,
    },
    {
      name: "break sentences that start with an unbreakable node",
      input:
        `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. [now here is a link](https://bobheadxi.dev) in a rather long sentence, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. \`and then some inline code\` in another sentence.`,
      expect:
        `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
[now here is a link](https://bobheadxi.dev) in a rather long sentence, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
\`and then some inline code\` in another sentence.
`,
    },
    // See: https://github.com/bobheadxi/readable/issues/1
    //     {
    //       name: "short sentence followed by long sentence should be broken",
    //       input: `# Document

    // here is another \`sentence\`! with a [a link](https://bobheadxi.dev) and **emphasis [bold link](https://github.com/bobheadxi)** and *italics* and ~~strike~~ and a ![cute image](https://bobheadxi.dev/assets/images/profile.jpg).`,
    //       expect: `# Document

    // here is another \`sentence\`!
    // with a [a link](https://bobheadxi.dev) and **emphasis [bold link](https://github.com/bobheadxi)** and *italics* and ~~strike~~ and a ![cute image](https://bobheadxi.dev/assets/images/profile.jpg).
    // `,
    //     },
  ]);
}

export {};
