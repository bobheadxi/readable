/**
 * Point within the text of a node
 */
export type Point = {
  line: number;
  column: number;
  offset: number;
};

/**
 * Position of a node
 */
export type Position = {
  start: Point;
  end: Point;
};

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
    // for multi-line nodes, simply use the length of the value if available
    if (isLiteralNode(n)) return n.value.length;
    else throw new Error(`Cannot take length of multi-line node '${n}'`);
  }
  return n.position.start.column - n.position.end.column;
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
