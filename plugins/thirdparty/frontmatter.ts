// CDN distributions of this remark-frontmatter does not seem to work, so adapt from
// https://github.com/remarkjs/remark-frontmatter

// deno-lint-ignore-file no-explicit-any

import { frontmatter as micromarkFrontmatter } from "micromark-extension-frontmatter";
import {
  frontmatterFromMarkdown,
  frontmatterToMarkdown,
} from "mdast-util-frontmatter";

import remark from "../../lib/remark.ts";

function frontmatter(options: any) {
  const data = remark.data();
  add("micromarkExtensions", micromarkFrontmatter(options));
  add("fromMarkdownExtensions", frontmatterFromMarkdown(options));
  add("toMarkdownExtensions", frontmatterToMarkdown(options));
  function add(field: any, value: any) {
    if (data[field]) data[field].push(value);
    else data[field] = [value];
  }
}

export default frontmatter;
