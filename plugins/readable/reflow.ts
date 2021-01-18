import {
  isParentNode,
  isValueNode,
  Node,
  nodeLength,
  NodeType,
  ParentNode,
  VFile,
} from "../../markdown/ast.ts";

// Inspired by https://sourcegraph.com/github.com/jlevy/atom-flowmark@master/-/blob/lib/remark-smart-word-wrap.js#L130:11

// Do a sentence wrap only after this column.
const SENTENCE_MIN_MARGIN = 45;

// TODO: still need a maximum, such that if the next sentence is too long, we must break. either that, or remove min margin

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

function reflowParagraph(paragraph: ParentNode) {
  let position = 0;
  let breakAllowed = false;
  let sentenceEnded = false;
  let currentLine: string[];
  let lines: string[][] = [];

  function resetColumn() {
    position = 0;
    sentenceEnded = false;
    breakAllowed = false;
  }

  function newText(withBreak: boolean) {
    currentLine = [];
    lines = [currentLine];
    if (withBreak) {
      resetColumn();
    }
  }

  function trimTrailingWhitespace() {
    if (currentLine.length > 0) {
      const lastLine = currentLine[currentLine.length - 1];
      currentLine[currentLine.length - 1] = lastLine.trimEnd();
    }
  }

  // Add linebreak on current text, if *possible*.
  //
  // Whether a break is *allowed* should be checked before this function.
  function breakLineIfPossible(isPlain: boolean) {
    // If a node isPlain, i.e. not inside a strong/emphasis/link, it's fine to break
    // immediately.
    //
    // If a node is no plain, strong/emphasis/link formatted, we can't break it on the
    // first character, so have to wait until next opportunity.
    //
    // Also avoid double breaks.
    const breakOk = (position > 0) && (isPlain || currentLine.length > 0);
    if (breakOk) {
      trimTrailingWhitespace();
      currentLine = [];
      lines.push(currentLine);
      resetColumn();
    }
    return breakOk;
  }

  // Add a word to the current line.
  function addWord(word: string, isTreePlain: boolean) {
    // Do sentence breaks, as long as the sentence is not crazy short
    const doSentenceBreak = sentenceEnded && position >= SENTENCE_MIN_MARGIN;
    if (breakAllowed && doSentenceBreak) {
      breakLineIfPossible(isTreePlain);
    }
    currentLine.push(word);

    // Update state
    position += word.length + 1;
    sentenceEnded = isEndOfSentenceWord(word);
    breakAllowed = false; // do not break twice
  }

  function addUnbreakableNode(node: Node) {
    position += nodeLength(node);
    sentenceEnded = false;
    breakAllowed = false;
  }

  function getLineBrokenText() {
    return lines.map((line) => line.join(" ")).join("\n");
  }

  function processParagraphTree(tree: ParentNode, reflowSet: NodeType[]) {
    console.debug(
      "Reflowing paragraph tree",
      { reflowSet },
      Deno.inspect(tree, { colors: true, depth: undefined }),
    );
    const isTreePlain = reflowSet.length === 0;

    for (let i = 0; i < tree.children.length; ++i) {
      const current = tree.children[i];
      // Handle subtree
      if (isParentNode(current)) {
        processParagraphTree(current, reflowSet.concat(current.type));
        continue;
      }
      // Ignore nodes that don't have a value for us to manipulate
      if (!isValueNode(current)) {
        continue;
      }

      switch (current.type) {
        case NodeType.Link: {
          addUnbreakableNode(current);
        }
        case NodeType.Text: {
          newText(false);
          const words = splitWords(current.value);
          for (const [j, word] of words.entries()) {
            breakAllowed = breakAllowed || (j > 0) || words.length === 1;
            addWord(word, isTreePlain);
          }
          current.value = getLineBrokenText();
        }
      }
    }
  }

  processParagraphTree(paragraph, []);
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
  return function transformer(node: Node, file: VFile) {
    console.debug(file);
    visit(node);
    return node;
  };
}
