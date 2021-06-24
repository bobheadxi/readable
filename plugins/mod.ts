// thirdparty plugins (such as official Remark plugins)
import thirdparty from "../plugins/thirdparty/mod.ts";

// custom plugins
import readable from "../plugins/readable/mod.ts";

export default [
  thirdparty.gfm,
  thirdparty.frontmatter,
  thirdparty.math,
  thirdparty.validateLinks,
  readable.reflow,
  thirdparty.stringify,
];
