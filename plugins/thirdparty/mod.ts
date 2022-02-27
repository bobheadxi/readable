import frontmatter from "./frontmatter.ts";
import stringify from "./stringify.ts";

import remarkGFM from "remark-gfm";
import remarkMath from "remark-math";

export default {
  frontmatter,
  gfm: remarkGFM,
  math: remarkMath,
  stringify,
};
