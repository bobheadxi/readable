// remark plugins
import remark from "../plugins/remark/mod.ts";

// custom plugins
import readable from "../plugins/readable/mod.ts";

export default [
  remark.gfm,
  remark.frontmatter,
  remark.math,
  readable.reflow,
  remark.stringify,
];
