import { assertEquals } from "../deps/asserts.ts";
import { testSuite } from "../lib/test.ts";

import { newTextNode, Node, nodeLength, zeroPosition } from "./ast.ts";

const sampleText = "hello world";

{
  testSuite<Node, number>("markdown/ast/nodeLength", (testCase) => {
    const got = nodeLength(testCase.input);
    assertEquals(got, testCase.expect);
  }, [
    {
      name: "literal node",
      input: newTextNode(sampleText, zeroPosition()),
      expect: sampleText.length,
    },
  ]);
}
