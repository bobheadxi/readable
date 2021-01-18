import {
  isParentNode,
  isValueNode,
  Node,
  nodeLength,
  NodeType,
  ParentNode,
  VFile,
} from "../markdown/ast.ts";

// Inspired by https://sourcegraph.com/github.com/jlevy/atom-flowmark@master/-/blob/lib/remark-smart-word-wrap.js#L130:11

// Do a sentence wrap only after this column.
const SENTENCE_MIN_MARGIN = 15;

/**
 * End of sentence must be two letters or more, with the last letter lowercase,
 * followed by a period, exclamation point, question mark, colon, or semicolon.
 * Except for colon or semicolon, a final or preceding parenthesis or quote is allowed.
 */
function isEndOfSentenceWord(word: string): boolean {
  return !!word.match(
    /([A-Z\da-z'’][a-z])([.?!]['"’”)]?|['"’”)][.?!]|[:;]) *$/,
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
    words[0] = " " + words[0];
  }

  if (text.match(/\s+$/)) {
    words[words.length - 1] = words[words.length - 1] + " ";
  }

  return words;
}

function reflowParagraph(paragraph: ParentNode, reflowSet: NodeType[]) {
  console.debug(
    "Reflowing paragraph",
    { reflowSet },
    Deno.inspect(paragraph, { colors: true, depth: undefined }),
  );

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
      currentLine[currentLine.length - 1] = currentLine[
        currentLine.length - 1
      ].trimEnd();
    }
  }

  // Add linebreak on current text, if allowed.
  function breakLine(isPlain: boolean) {
    // If a node isPlain, i.e. not inside a strong/emphasis/link, it's fine to break.
    // If a node is strong/emphasis/link formatted, we can't break it on the
    // first character, so have to wait until next opportunity.
    // Also avoid double breaks.
    const breakOk = position > 0 && (isPlain || currentLine.length > 0);
    if (breakOk) {
      trimTrailingWhitespace();
      currentLine = [];
      lines.push(currentLine);
      resetColumn();
    }

    return breakOk;
  }

  function addWord(word: string, followsSpace: boolean, isPlain: boolean) {
    // Wrap if possible
    // TODO(@bobheadxi) this heuristic is too aggressive
    breakAllowed = breakAllowed || followsSpace || word.startsWith(" ");
    const doSentenceBreak = sentenceEnded && position >= SENTENCE_MIN_MARGIN;
    if (
      breakAllowed && doSentenceBreak
    ) {
      const didBreak = breakLine(isPlain);
      if (word === " ") {
        return;
      }
      currentLine.push(didBreak ? word.trimStart() : word);
    } else {
      currentLine.push(word);
    }

    position += word.length + 1;
    sentenceEnded = isEndOfSentenceWord(word);
    breakAllowed = word.endsWith(" ");
  }

  function addUnbreakableNode(node: Node) {
    if (breakAllowed) {
      newText(true);
    }

    position += nodeLength(node);
    sentenceEnded = false;
    breakAllowed = false;
  }

  function getLineBrokenText() {
    return lines.map((line) => line.join(" ")).join("\n");
  }

  for (let i = 0; i < paragraph.children.length; ++i) {
    const current = paragraph.children[i];
    if (isParentNode(current)) {
      reflowParagraph(current, reflowSet.concat(current.type));
      continue;
    }

    const next = i + 1 < paragraph.children.length && paragraph.children[i + 1];
    if (!isValueNode(current)) {
      continue;
    }

    switch (current.type) {
      case NodeType.Link: {
        addUnbreakableNode(current);
      }
      case NodeType.Text: {
        newText(false);

        const isPlain = reflowSet.length === 0;
        const words = splitWords(current.value);
        for (const [j, element] of words.entries()) {
          addWord(element, j > 0, isPlain);
        }

        // Add break at the end of this text node if the next next word/link isn't going to fit.
        // Unless there is no whitespace at the end of the last text node.
        if (
          next &&
          words[words.length - 1].endsWith(" ")
        ) {
          breakLine(isPlain);
        }

        current.value = getLineBrokenText();
      }
    }
  }
}

export default function reflowParagraphs() {
  // Traverse tree looking for the right group of nodes to process
  function visit(node: Node) {
    if (!isParentNode(node)) {
      return;
    }

    switch (node.type) {
      case NodeType.Paragraph:
        reflowParagraph(node, []);

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
