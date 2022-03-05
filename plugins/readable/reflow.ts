import { getLogger, Logger } from "log/mod.ts";

import semantics from "./semantics.ts";
import {
  isLiteralNode,
  isParentNode,
  newTextNode,
  Node,
  nodeLength,
  NodeType,
  ParentNode,
} from "../../markdown/ast.ts";
import { escapeContent } from "../../lib/diff.ts";
import { english } from "../../grammar/mod.ts";

/**
 * ReflowParagraphState tracks the state of a paragraph being reflowed.
 */
class ReflowParagraphState {
  private log: Logger;
  private content = "";
  constructor(log: Logger) {
    this.log = log;
  }

  private currentLineColumn = 0;

  /**
   * Sentence wrap rules.
   */
  margins = {
    min: 45,
    max: 80,
  };

  /**
   * Add text to the paragraph.
   *
   * @param text value of text node
   * @param plain whether or not the text is inside another node
   */
  addText(text: string, plain: boolean) {
    this.currentLineColumn = 0;
    this.content = text;
  }

  /**
   * Add a node that should not be processed to the paragraph.
   *
   * @param node markdown AST node
   * @returns whether or not a line break should follow
   */
  addRawNode(node: Node): boolean {
    const currentColumn = this.render().split("\n").pop()?.length ||
      this.currentLineColumn;
    if (currentColumn > this.margins.min) {
      // Add this to a new line, resetting the current column
      this.currentLineColumn = nodeLength(node);
      return true;
    }
    const cannotMerge = (currentColumn + nodeLength(node)) > this.margins.max;
    if (cannotMerge) {
      this.currentLineColumn = nodeLength(node);
    } else {
      this.currentLineColumn += nodeLength(node) + 1;
    }
    return cannotMerge;
  }

  /**
   * Export the current lines.
   */
  render(): string {
    let skipped = "";
    // TODO incremental or try different initial rules
    let match = english.match(this.content);
    while (match.failed()) {
      const parts = this.content.split(" ");
      if (parts.length <= 1) {
        return skipped + parts[0];
      }
      skipped += parts[0] + " ";
      const next = parts.splice(1).join(" ");
      this.log.warning("trying again", { skipped, next });
      match = english.match(next);
    }

    let rendered = skipped +
      semantics(this.margins, this.currentLineColumn)(match).render();
    if (this.content.startsWith(" ")) {
      rendered = " " + rendered;
    } else if (this.content.endsWith(" ")) {
      rendered += " ";
    }
    return rendered;
  }

  /**
   * Returns simple representation of useful parts of the state.
   */
  getState() {
    return {
      currentLineColumn: this.currentLineColumn,
    };
  }
}

/**
 * Reflow the top-level node containing a paragraph.
 *
 * @param paragraph
 */
function reflowParagraph(log: Logger, paragraph: ParentNode) {
  const state = new ReflowParagraphState(log);

  /**
   * Visitor function for processing a tree of nodes that consist of parts of the paragraph.
   */
  function processParent(tree: ParentNode, parentTypes: NodeType[]) {
    const isTreePlain = parentTypes.length === 0;
    let previous: Node | undefined;

    // Process all text in this tree
    for (let i = 0; i < tree.children.length; ++i) {
      const isLastChild = i === (tree.children.length - 1);
      const current = tree.children[i];

      switch (current.type) {
        // Normal text
        case NodeType.Text:
          // Ignore nodes that don't have a value for us to manipulate
          if (!isLiteralNode(current)) {
            continue;
          }
          state.addText(current.value, isTreePlain);
          current.value = state.render();
          log.debug("Added text node", state.getState());
          break;

        // Unbreakable nodes

        case NodeType.Link:
        case NodeType.InlineCode:
          // Since we aren't just breaking the value of a text node, we need to make
          // adjustments to the previous node or the tree.
          const shouldBreakLine = state.addRawNode(current);
          if (shouldBreakLine && previous) {
            if (isLiteralNode(previous)) {
              // Finalize previous, if it is finalizable
              previous.value = state.render();
              if (!isLastChild) {
                previous.value += "\n";
              }
            } else {
              // Otherwise, insert a new line to create a break
              tree.children.splice(i, 0, newTextNode("\n", previous.position));
            }
          }
          log.debug(
            `Added unbreakable '${current.type}' node`,
            state.getState(),
          );
          break;

        // Unhandled nodes

        default:
          // Try to process
          if (isParentNode(current)) {
            log.debug(`Handling children of '${current.type}' node`);
            processParent(current, parentTypes.concat(current.type));
          } else {
            log.debug(`Ignored '${current.type}' node`);
          }
      }

      previous = current;
    }
  }

  processParent(paragraph, []);
}

export default function reflow() {
  const log = getLogger("reflow");

  // Traverse tree looking for the right group of nodes to process
  function visit(node: Node) {
    if (!isParentNode(node)) {
      return;
    }

    switch (node.type) {
      case NodeType.Paragraph:
        reflowParagraph(log, node);

      default:
        node.children.forEach((child) => visit(child));
    }
  }

  // Plugin function
  return function transformer(node: Node) {
    visit(node);
    return node;
  };
}
