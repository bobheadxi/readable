import { isParentNode, Node, NodeType, ParentNode, VFile } from "../markdown/ast.ts";

function reflowParagraph(node: ParentNode) {
  console.log(Deno.inspect(node, { colors: true, depth: undefined }))
}

function reflowParagraphs() {
  // Traverse tree looking for the right group of nodes to process
  function visit(node: Node) {
    if (!isParentNode(node)) {
      return
    }

    switch (node.type) {
    case NodeType.Paragraph:
      reflowParagraph(node)

    default:
      node.children.forEach((child) => visit(child))
    }
  }

  // Plugin function
  return function transformer(node: Node, file: VFile) {
    console.log(file)
    visit(node)
  };
}

export default reflowParagraphs;
