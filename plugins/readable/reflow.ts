import {
  isLiteralNode,
  isParentNode,
  Node,
  nodeLength,
  NodeType,
  ParentNode,
} from "../../markdown/ast.ts";

// Do a sentence wrap only after this column.
const SENTENCE_MIN_MARGIN = 45;

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
   */
  addRawNode(node: Node) {
    this.currentColumn += nodeLength(node);
    this.sentenceEnded = false;
    this.breakAllowed = false;
  }

  /**
   * Export the current lines.
   */
  render(): string {
    return this.lines.map((line) => line.join(" ")).join("\n");
  }

  /**
   * Set containing all processed lines within the paragraph
   */
  private lines: string[][] = [];

  /**
   * Position of current column
   */
  private currentColumn: number = 0;
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
   * Returns simple string representation of some parts of the state.
   */
  toString(): string {
    return JSON.stringify({
      lineCount: this.lines.length,
      currentLine: this.currentLine,
      currentColumn: this.currentColumn,
      breakAllowed: this.breakAllowed,
      sentenceEnded: this.sentenceEnded,
    });
  }

  /**
   * Add a word to the current line.
   * 
   * @param word individual word text
   * @param isTreePlain 
   */
  private appendWord(word: string, isTreePlain: boolean) {
    if (this.shouldBreakLine(isTreePlain)) {
      this.breakLine();
    }
    this.currentLine.push(word);
    this.currentColumn += word.length + 1;
    this.sentenceEnded = isEndOfSentenceWord(word);
  }

  /**
   * Whether or not a line break should be created
   */
  private shouldBreakLine(isPlain: boolean) {
    // Break whenever we see an end of sentence, given the sentence is not too short.
    const canSentenceBreak = this.sentenceEnded &&
      this.currentColumn >= SENTENCE_MIN_MARGIN;
    // If a node isPlain (i.e. not inside a strong/emphasis/link) it's fine to break
    // immediately. If not (i.e. is strong/emphasis/link formatted), we can't break it on
    // the first character, so have to wait until next opportunity.
    const canBreakLine = (isPlain || this.currentLine.length > 0);

    return this.breakAllowed && canSentenceBreak && canBreakLine;
  }

  /**
   * Adds a line break.
   */
  private breakLine() {
    this.trimCurrentLine();
    this.currentLine = [];
    this.lines.push(this.currentLine); // ref to current line

    this.currentColumn = 0;
    this.sentenceEnded = false;
    this.breakAllowed = false; // do not break twice in a row
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
function reflowParagraph(paragraph: ParentNode) {
  const state = new ReflowParagraphState();

  /**
   * Visitor function for processing a tree of nodes that consist of parts of the paragraph.
   */
  function processParent(tree: ParentNode, parentTypes: NodeType[]) {
    const isTreePlain = parentTypes.length === 0;

    // Process all text in this tree
    for (let i = 0; i < tree.children.length; ++i) {
      const current = tree.children[i];
      // Handle subtree
      if (isParentNode(current)) {
        processParent(current, parentTypes.concat(current.type));
        continue;
      }
      // Ignore nodes that don't have a value for us to manipulate
      if (!isLiteralNode(current)) {
        continue;
      }

      switch (current.type) {
        case NodeType.Link:
          state.addRawNode(current);
          break;
        case NodeType.Text:
          state.addText(current.value, isTreePlain);
          current.value = state.render();
          break;
      }

      console.debug(state.toString());
    }
  }

  processParent(paragraph, []);
}

export default function reflow() {
  // Traverse tree looking for the right group of nodes to process
  function visit(node: Node) {
    if (!isParentNode(node)) {
      return;
    }

    switch (node.type) {
      case NodeType.Paragraph:
        reflowParagraph(node);

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
