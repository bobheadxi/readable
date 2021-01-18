// remark-stringify ships with remark and can be configured with just an object.
// See https://github.com/remarkjs/remark/tree/main/packages/remark#settings-through-a-preset
//
// For specific configuration options, see
// https://github.com/syntax-tree/mdast-util-to-markdown#formatting-options
export default {
  settings: {
    // bullets
    bullet: "-",

    // code
    fences: true,

    // lists
    incrementListMarker: true,
    listItemIndent: "one",

    // rules
    rule: "-",
    ruleSpaces: true,

    // text
    strong: "*",
  },
};
