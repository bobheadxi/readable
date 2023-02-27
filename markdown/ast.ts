/**
 * Point within the text of a node
 */
export type Point = {
  line: number;
  column: number;
  offset: number;
};

function zeroPoint(): Point {
  return { line: 0, column: 0, offset: 0 };
}

/**
 * Position of a node
 */
export type Position = {
  start: Point;
  end: Point;
};

export function zeroPosition(): Position {
  return {
    start: zeroPoint(),
    end: zeroPoint(),
  };
}

function positionAfter(p: Position, length: number): Position {
  return {
    start: {
      line: p.end.line,
      column: p.end.column,
      offset: p.end.offset,
    },
    end: {
      line: p.end.line,
      column: p.end.column + length,
      offset: p.end.offset + length,
    },
  };
}

/**
 * Node types - see https://github.com/syntax-tree/mdast#nodes
 *
 * Can be extended by remark plugins - see https://github.com/syntax-tree/mdast#extensions
 */
export enum NodeType {
  // AST types
  Root = "root",

  // Text types
  Paragraph = "paragraph",
  Heading = "heading",
  Text = "text",

  // Formatting types
  Delete = "delete",
  Strong = "strong",
  Image = "image",
  Link = "link",

  // List types
  List = "list",
  ListItem = "listItem",

  // Code types
  Code = "code",
  InlineCode = "inlineCode",

  // Fontmatter
  YAML = "yaml",
}

/**
 * Base node definiton - see https://github.com/syntax-tree/mdast#nodes
 */
export interface Node {
  type: NodeType;
  position: Position;
}

/**
 * Attempts to describe the length of a node.
 */
export function nodeLength(n: Node): number {
  if (n.position.start.line !== n.position.end.line) {
    // If we have a value, just take that length
    if (isLiteralNode(n)) return n.value.length;
    else throw new Error(`Cannot infer length of node '${JSON.stringify(n)}'`);
  }
  return n.position.end.column - n.position.start.column;
}

/**
 * Node with children - see https://github.com/syntax-tree/mdast#parent
 */
export interface ParentNode extends Node {
  children: Node[];
}

/**
 * Describes if the given node has children.
 */
export function isParentNode(n: Node): n is ParentNode {
  return (n as any).children;
}

/**
 * Node with a value - see https://github.com/syntax-tree/mdast#literal
 */
export interface LiteralNode extends Node {
  value: string;
}

/**
 * Describes if the given node has a value.
 */
export function isLiteralNode(n: Node): n is LiteralNode {
  return (n as any).value;
}

export function newTextNode(value: string, after: Position): LiteralNode {
  return {
    type: NodeType.Text,
    value,
    position: positionAfter(after, value.length),
  };
}
