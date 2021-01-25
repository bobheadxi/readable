// see https://github.com/syntax-tree/mdast

export type Point = {
  line: number;
  column: number;
  offset: number;
};

export type Position = {
  start: Point;
  end: Point;
};

export enum NodeType {
  Root = "root",
  Heading = "heading",
  List = "list",
  ListItem = "listItem",

  Paragraph = "paragraph",
  Text = "text",
  Code = "code",
  InlineCode = "inlineCode",
  Delete = "delete",
  Strong = "strong",
  Image = "image",
  Link = "link",

  // Fontmatter
  YAML = "yaml",
}

export interface Node {
  type: NodeType;
  position: Position;
}

export function nodeLength(n: Node): number {
  if (n.position.start.line !== n.position.end.line) {
    // for multi-line nodes, simply use the length of the value if available
    if (isValueNode(n)) return n.value.length;
    else throw new Error(`Cannot take length of multi-line node '${n}'`);
  }
  return n.position.start.column - n.position.end.column;
}

export interface ParentNode extends Node {
  children: Node[];
}

export function isParentNode(n: Node): n is ParentNode {
  return (n as any).children;
}

export interface ValueNode extends Node {
  value: string;
}

export function isValueNode(n: Node): n is ValueNode {
  return (n as any).value;
}
