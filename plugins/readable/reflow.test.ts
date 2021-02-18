import { fail } from "../../deps/asserts.ts";
import remark from "../../deps/remark.ts";
import format from "../../markdown/format.ts";
import { diff } from "../../lib/diff.ts";

import reflow from "./reflow.ts";
import { lorenIpsumLines, lorenIpsumText, TestSuite } from "../../lib/test.ts";

// e2e tests just run a format
{
  const testRemark = remark.use(reflow);
  new TestSuite<string, string>("plugins/readable/reflow:e2e", (testCase) => {
    const got = format(testCase.input, testRemark);
    if (diff(testCase.expect, got)) {
      fail("Unexpected diff");
    }
  }, [
    {
      case: "should split Lorem Ipsum",
      input: lorenIpsumText(),
      expect: lorenIpsumLines().join("\n") + "\n",
    },
    {
      case: "break sentences that start with an unbreakable node",
      input: `${
        lorenIpsumLines()[0]
      } [now here is a link](https://bobheadxi.dev) in a rather long sentence, ${
        lorenIpsumLines()[1]
      } \`and then some inline code\` in another sentence.`,
      expect: `${lorenIpsumLines()[0]}
[now here is a link](https://bobheadxi.dev) in a rather long sentence, ${
        lorenIpsumLines()[1]
      }
\`and then some inline code\` in another sentence.
`,
    },
    // See: https://github.com/bobheadxi/readable/issues/1
    //     {
    //       case: "short sentence followed by long sentence should be broken",
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
