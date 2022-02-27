import { getLogger, Logger } from "log/mod.ts";

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

/**
 * End of sentence is marked by a period, exclamation point, question mark, colon, or semicolon.
 * Except for colon or semicolon, a final or preceding parenthesis or quote is allowed.
 */
function isEndOfSentenceWord(word: string): boolean {
  return !!word.match(
    /([.?!]['"’”)]?|['"’”)][.?!]|[:]) *$/,
  );
}

/**
 * Split text into words, treating all whitespace as a break. Leading and trailing
 * spaces are preserved and go onto the first and last words.
 */
function splitWords(text: string): string[] {
  const trimmed = text.trim();
  if (trimmed === "") {
    return [" "];
  }

  const words = trimmed.replace(/\s+/g, " ").split(" ");
  if (text.match(/^\s+/)) {
    // add back trimmed whitespace to start
    words[0] = ` ${words[0]}`;
  }
  if (text.match(/\s+$/)) {
    // add back trimmed whitespace to end
    words[words.length - 1] = `${words[words.length - 1]} `;
  }
  return words;
}

/**
 * ReflowParagraphState tracks the state of a paragraph being reflowed.
 */
class ReflowParagraphState {
  log: Logger;
  constructor(log: Logger) {
    this.log = log;
  }

  /**
   * Add text to the paragraph.
   *
   * @param text value of text node
   * @param plainTree whether or not the text is inside another node
   */
  addText(text: string, plainTree: boolean) {
    this.currentLine = [];
    this.lines = [this.currentLine];
    const words = splitWords(text);
    for (const [j, word] of words.entries()) {
      if ((j > 0) || words.length === 1) {
        this.breakAllowed = true;
      }
      this.appendWord(word, plainTree);
    }
  }

  /**
   * Add a node that should not be processed to the paragraph.
   *
   * @param node markdown AST node
   * @returns whether or not a line break should follow
   */
  addRawNode(node: Node) {
    // Unbreakable nodes still count towards length of a line.
    if (this.sentenceEnded) {
      this.breakLine({ rawNode: true });
    }
    this.currentLineColumn += nodeLength(node);
    return this.sentenceEnded ? this.breakLine({ rawNode: true }) : false;
  }

  /**
   * Export the current lines.
   */
  render(opts?: { isLastChild?: boolean; isUnbreakable?: boolean }): string {
    // If this is the last child, drop trailing empty line before rendering.
    if (
      opts?.isLastChild && this.lines.length > 1 &&
      this.currentLine.length === 0
    ) {
      this.lines.pop();
    }

    let rendered = this.lines.map((line) => line.join(" ")).join("\n");

    // Preserve spacing if this is an unbreakable node.
    if (opts?.isUnbreakable) {
      rendered += " ";
    }

    this.log.debug(
      `Rendered ${JSON.stringify(this.lines)} to '${escapeContent(rendered)}'`,
    );
    return rendered;
  }

  /**
   * Set containing all processed lines within the paragraph
   */
  private lines: string[][] = [];

  /**
   * Previous line's column position
   */
  private previousLineColumn: number = 0;
  /**
   * Current line's column position
   */
  private currentLineColumn: number = 0;
  /**
   * Words that make up the current line
   */
  private currentLine: string[] = [];

  /**
   * Whether a break is allowed in the current line
   */
  private breakAllowed: boolean = false;
  /**
   * Whether a sentence end has been detected in the current line
   */
  private sentenceEnded: boolean = false;

  /**
   * Do a sentence wrap only after this column.
   */
  private sentenceMinMargin = 45;

  /**
   * Returns simple representation of useful parts of the state.
   */
  getState() {
    return {
      lineCount: this.lines.length,
      previousColumn: this.previousLineColumn,
      currentColumn: this.currentLineColumn,
      breakAllowed: this.breakAllowed,
      currentLine: JSON.stringify(this.currentLine),
    };
  }

  /**
   * Add a word to the current line.
   *
   * @param word individual word text
   * @param isTreePlain whether this text belongs inside another node
   */
  private appendWord(word: string, isTreePlain: boolean) {
    this.currentLine.push(word);
    this.currentLineColumn += word.length + 1;
    if (isEndOfSentenceWord(word)) {
      this.sentenceEnded = true;
      this.breakLine({ isTreePlain });
    } else if (this.sentenceEnded) {
      // Adding a non-end-of-sentence after a sentence has ended
      this.sentenceEnded = false;
    }
  }

  /**
   * Adds a line break.
   *
   * @param state information about the state
   * @returns whether or not a line break was created before adding this node
   */
  private breakLine(
    state?: { isTreePlain?: boolean; rawNode?: boolean },
  ): boolean {
    // If a node isPlain (i.e. not inside a strong/emphasis/link) it's fine to break
    // immediately. If not (i.e. is strong/emphasis/link formatted), we can't break it on
    // the first character, so have to wait until next opportunity.
    const canBreakLine = (state?.isTreePlain || this.currentLineColumn > 0);

    // Decide a line break strategy if allowed.
    if (this.breakAllowed && canBreakLine) {
      // Prepare current line.
      this.trimCurrentLine();

      // Check if this sentence can be merged into the previous sentence instead, if a
      // previous sentence has been tracked already.
      const mergedLength = this.previousLineColumn + this.currentLineColumn;
      const shouldMerge = this.lines.length >= 2 &&
        mergedLength < this.sentenceMinMargin;
      if (shouldMerge) {
        const current = this.lines.pop();
        const previous = this.lines.pop();
        if (current && previous) {
          this.log.debug("Breaking line by merging", {
            current,
            previous,
            state,
          });
          this.lines.push([...previous, ...current]);
          this.previousLineColumn = mergedLength;
        } else {
          throw new Error(
            "Unexpected absence of current and/or previous when merging lines",
          );
        }
      } else {
        this.log.info("Breaking line by starting anew", { state });
        this.previousLineColumn = this.currentLineColumn;
      }

      // Start collecting a new line, now that the current line has been handled.
      // If this is a raw node, the current line hasn't actually been handled, so we don't
      // reset the line yet.
      if (!state?.rawNode) {
        this.currentLine = [];
        this.currentLineColumn = this.currentLine.length;
        this.lines.push(this.currentLine); // ref to the new, blank line
      }
      this.breakAllowed = false; // do not break twice in a row

      // Indicate a line was broken
      return true;
    }

    return false;
  }

  /**
   * Trim end off the current line.
   */
  private trimCurrentLine() {
    if (this.currentLine.length > 0) {
      const length = this.currentLine.length - 1;
      const last = this.currentLine[length];
      this.currentLine[length] = last.trimEnd();
    }
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
          current.value = state.render({ isLastChild });
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
              previous.value = state.render({
                isLastChild,
                isUnbreakable: true,
              });
            } else {
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
