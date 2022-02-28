import { assertEquals, fail } from "testing/asserts.ts";

import { lorenIpsumText, TestSuite } from "../lib/test.ts";
import { matchEnglish } from "./mod.ts";
import { Expression, Node } from "./cst.ts";

type assertNode = {
  expression: Expression;
  children?: assertNode[];
};

function assertNodesEqual(actual: Node, want: assertNode) {
  assertEquals(actual.ctorName, want.expression);
  if (!want.children) {
    return;
  }
  assertEquals(
    actual.children.length,
    want.children.length,
    want.children.map((c) => c.expression).join(", "),
  );
  want.children.forEach((n, i) => {
    assertNodesEqual(actual.children[i], n);
  });
}

new TestSuite<
  string,
  assertNode[]
>(
  "grammar/english",
  ({ input, expect }) => {
    const { match, root } = matchEnglish(input);
    if (!match.succeeded()) {
      fail(match.message);
    }
    assertEquals(root.children.length, expect.length);
    expect.forEach((n, i) => {
      assertNodesEqual(root.children[i], n);
    });
  },
  [
    {
      case: "simple loren ipsum sentences",
      input: lorenIpsumText(),
      expect: [
        { expression: "SemanticLine" },
        { expression: "SemanticLine" },
        { expression: "SemanticLine" },
        { expression: "SemanticLine" },
      ],
    },
    {
      case: "punctuation sentence enders",
      input: "Hello world! This is another sentence?",
      expect: [
        {
          expression: "SemanticLine",
          children: [{
            expression: "SemanticSentence",
            children: [{
              expression: "_iter",
              children: [{
                expression: "Word",
              }, {
                expression: "Word",
              }],
            }],
          }, {
            expression: "sentenceEnd",
          }],
        },
        {
          expression: "SemanticLine",
          children: [{
            expression: "SemanticSentence",
            children: [{
              expression: "_iter",
              children: [
                { expression: "Word" },
                { expression: "Word" },
                { expression: "Word" },
                { expression: "Word" },
              ],
            }],
          }, {
            expression: "sentenceEnd",
          }],
        },
      ],
    },
    {
      case: "contracted word",
      input: "This is Robert's word",
      expect: [
        {
          expression: "SemanticLine",
          children: [{
            expression: "SemanticSentence",
            children: [{
              expression: "_iter",
              children: [{
                expression: "Word",
              }, {
                expression: "Word",
              }, {
                expression: "Word",
                children: [{
                  expression: "contractedWord" as Expression,
                }],
              }, {
                expression: "Word",
              }],
            }],
          }, {
            expression: "sentenceEnd",
          }],
        },
      ],
    },
    // I am a Heimer-Dinger.
    {
      case: "concatenated words",
      input: "I am a Heimer-Dinger.",
      expect: [
        {
          expression: "SemanticLine",
          children: [{
            expression: "SemanticSentence",
            children: [{
              expression: "_iter",
              children: [{
                expression: "Word",
              }, {
                expression: "Word",
              }, {
                expression: "Word",
              }, {
                expression: "Word",
                children: [{
                  expression: "concatenatedWord" as Expression,
                }],
              }],
            }],
          }, {
            expression: "sentenceEnd",
          }],
        },
      ],
    },
    {
      case: "acronym",
      input: "Some things, e.g. chicken",
      only: true,
      expect: [
        {
          expression: "SemanticLine",
          children: [{
            expression: "SemanticSentence",
            children: [{
              expression: "_iter",
              children: [{
                expression: "Word",
              }, {
                expression: "Word",
              }, {
                expression: "SemanticPause",
              }, {
                expression: "Word",
                children: [{
                  expression: "acronym" as Expression,
                }],
              }, {
                expression: "Word",
              }],
            }],
          }, {
            expression: "sentenceEnd",
          }],
        },
      ],
    },
    {
      case: "semantic line breaks might not be sentence ends",
      input:
        "I start, I hesitate - I pause–then I dance: this is what makes napping fun!",
      expect: [
        { expression: "SemanticLine" },
        { expression: "SemanticLine" },
        { expression: "SemanticLine" },
        { expression: "SemanticLine" },
      ],
    },
    {
      case: "quotes are part of words",
      input: `"Hello", he said. "Fancy seeing 'you' here!"`,
      expect: [
        { expression: "SemanticLine" },
        { expression: "SemanticLine" },
        { expression: "SemanticLine" },
      ],
    },
  ],
);

export {};
