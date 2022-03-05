import { english } from "../../grammar/mod.ts";

const rawContentDelimiters = {
  start: "{{ begin rawContent }}",
  end: "{{ end rawContent }}",
};

function replaceRawContentDelimters(str: string) {
  return str
    .replaceAll(rawContentDelimiters.start, "")
    .replaceAll(rawContentDelimiters.end, "");
}

function semantics(
  margins: { min: number; max: number },
  startColumn?: number,
) {
  return english.createSemantics().addOperation("render", {
    _terminal() {
      return this.sourceString;
    },
    Paragraph(root): string {
      const reflowed: string[] = [];
      if (startColumn) {
        reflowed.push("x".repeat(startColumn));
      }
      root.children.forEach((n) => {
        // Only want SemanticLines in children of the root node
        if (n.ctorName !== "SemanticLine") {
          throw new Error(`unexpected ctorName ${n.ctorName}`);
        }

        const semanticLine = replaceRawContentDelimters(n.source.contents);
        if (reflowed.length === 0) {
          reflowed.push(semanticLine);
          return;
        }

        const prevIdx = reflowed.length - 1;
        const prevLength = reflowed[prevIdx].length;
        const mergedLength = reflowed[prevIdx].length + semanticLine.length;
        if (prevLength < margins.min && mergedLength < margins.max) {
          reflowed[prevIdx] += semanticLine;
        } else {
          reflowed.push(semanticLine);
        }
      });

      if (startColumn) {
        return reflowed.slice(1).map((v) => v.trimEnd()).join("\n");
      }
      return reflowed.map((v) => v.trimEnd()).join("\n");
    },
  });
}

export default semantics;
