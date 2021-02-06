import { assertEquals } from "../../deps/asserts.ts";
import remark from "../../deps/remark.ts";
import format from "../../markdown/format.ts";

import reflow from "./reflow.ts";

// e2e tests just run a format
{
  const testSuite = "plugins/readable/reflow:e2e";
  const testRemark = remark.use(reflow);

  const cases: {
    name: string;
    input: string;
    want: string;
    testArgs?: Deno.TestDefinition;
  }[] = [
    {
      name: "should split Lorem Ipsum",
      input:
        `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
      want:
        `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
`,
    },
    {
      name: "short sentence followed by long sentence should be broken",
      input: `# Document

here is another \`sentence\`! with a [a link](https://bobheadxi.dev) and **emphasis [bold link](https://github.com/bobheadxi)** and *italics* and ~~strike~~ and a ![cute image](https://bobheadxi.dev/assets/images/profile.jpg).`,
      want: `# Document

here is another \`sentence\`!
with a [a link](https://bobheadxi.dev) and **emphasis [bold link](https://github.com/bobheadxi)** and *italics* and ~~strike~~ and a ![cute image](https://bobheadxi.dev/assets/images/profile.jpg).
`,
    },
  ];
  cases.forEach((testCase) => {
    Deno.test({
      name: `${testSuite} :: ${testCase.name}`,
      fn: () => {
        const got = format(testCase.input, testRemark);
        assertEquals<string>(got, testCase.want);
      },
      ...testCase.testArgs,
    });
  });
}

export {};
