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
      // TODO https://github.com/bobheadxi/readable/issues/7#issuecomment-765043636
      case: "ignore 'sentences' that look like acronyms",
      only: true,
      input: `Upload the repository to a specific "sourcegraph-$ LANGUAGE" organization (where $LANGUAGE is the primary language of the repository as identified by github.com) (e.x. the ["sourcegraph-go" organization](https://ghe.sgdev.org/sourcegraph-go) for <https://ghe.sgdev.org/sourcegraph-go/gorilla-mux>)`,
      expect: `Upload the repository to a specific "sourcegraph-$ LANGUAGE" organization (where $LANGUAGE is the primary language of the repository as identified by github.com) (e.x. the ["sourcegraph-go" organization](https://ghe.sgdev.org/sourcegraph-go) for <https://ghe.sgdev.org/sourcegraph-go/gorilla-mux>)
`,
    },

  ]);
}

export {};
