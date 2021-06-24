import frontmatter from "./frontmatter.ts";
import stringify from "./stringify.ts";

import remarkGFM from "https://cdn.skypack.dev/remark-gfm@1.0.0";
import remarkMath from "https://cdn.skypack.dev/remark-math@4.0.0";
import remarkValidateLinks from "https://cdn.skypack.dev/remark-validate-links@10.0.4";

export default {
  frontmatter,
  gfm: remarkGFM,
  math: remarkMath,
  validateLinks: remarkValidateLinks,
  stringify,
};
