import { assertEquals } from "../deps/asserts.ts";
import { TestSuite } from "../lib/test.ts";

import { newTextNode, Node, nodeLength, zeroPosition } from "./ast.ts";

const sampleText = "hello world";

{
  new TestSuite<Node, number>("markdown/ast/nodeLength", (testCase) => {
    const got = nodeLength(testCase.input);
    assertEquals(got, testCase.expect);
  }, [
    {
      case: "literal node",
      input: newTextNode(sampleText, zeroPosition()),
      expect: sampleText.length,
    },
  ]);
}
