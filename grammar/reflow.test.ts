import { english } from "./mod.ts";

const rawContentDelimiters = {
  start: "{{ begin rawContent }}",
  end: "{{ end rawContent }}",
};

function replaceRawContentDelimters(str: string) {
  return str
    .replaceAll(rawContentDelimiters.start, "")
    .replaceAll(rawContentDelimiters.end, "");
}

const semantics = english.createSemantics().addOperation("reflow", {
  _terminal() {
    return this.sourceString;
  },
  Paragraph(nodes): string {
    const minMargin = 45;
    const reflowed: string[] = [];
    nodes.children.forEach((n) => {
      if (n.ctorName !== "SemanticLine") {
        throw new Error(`unexpected ctorName ${n.ctorName}`);
      }

      const semanticLine = replaceRawContentDelimters(n.source.contents);
      if (reflowed.length === 0) {
        reflowed.push(semanticLine);
        return;
      }

      const prevIdx = reflowed.length - 1;
      const mergedLength = reflowed[prevIdx].length + semanticLine.length;
      if (mergedLength < minMargin) {
        reflowed[prevIdx] += semanticLine;
      } else {
        reflowed.push(semanticLine);
      }
    });
    return reflowed.join("\n");
  },
});

Deno.test({
  name: "prototype",
  fn() {
    const m = english.match(
      "I start, I hesitate - I pause–then I dance: this is what makes napping {{ begin rawContent }}[fun](link){{ end rawContent }}!",
    );
    console.log("\n" + semantics(m).reflow());
  },
});
