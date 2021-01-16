// see https://github.com/syntax-tree/mdast

export type Point = {
  line: number;
  offset: number;
};

export type Position = {
  start: Point;
  end: Point;
};

export enum NodeType {
  Root = "root",
  Heading = "heading",
  Paragraph = "paragraph",
  Text = "text",
  List = "list",
  ListItem = "listItem",
  Code = "code",

  // Fontmatter
  YAML = "yaml",
}

export interface Node {
  type: NodeType
  position: Position
}

export interface ParentNode extends Node {
  children: Node[]
}

export function isParentNode(n: Node): n is ParentNode {
  return (n as any).children
}

export interface ValueNode extends Node {
  value: string
}

export function isText(n: Node): n is ValueNode {
  return (n.type === NodeType.Text) && (n as any).value
}

export function isDocument(n: ValueNode): boolean {
  return (n.value === 'Document')
}

export type VFile = {
  data: any;
  messages: any[];
  history: any[];
  cwd: string;
  contents: string;
};
