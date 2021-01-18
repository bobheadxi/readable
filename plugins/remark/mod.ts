import frontmatter from "./frontmatter.ts";

import remarkGFM from "https://cdn.skypack.dev/remark-gfm@1.0.0";
import remarkMath from "https://cdn.skypack.dev/remark-math@4.0.0";

export default {
  frontmatter,
  gfm: remarkGFM,
  math: remarkMath,
};
