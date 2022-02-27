import frontmatter from "./frontmatter.ts";
import stringify from "./stringify.ts";

import remarkGFM from "https://cdn.skypack.dev/remark-gfm@1";
import remarkMath from "https://cdn.skypack.dev/remark-math@4";

export default {
  frontmatter,
  gfm: remarkGFM,
  math: remarkMath,
  stringify,
};
