// CDN distributions of this remark-frontmatter does not seem to work, so adapt from
// https://github.com/remarkjs/remark-frontmatter

import { frontmatter as micromarkFrontmatter } from "https://jspm.dev/micromark-extension-frontmatter@1";
import {
  frontmatterFromMarkdown,
  frontmatterToMarkdown,
} from "https://jspm.dev/mdast-util-frontmatter@1";
import remark from "../../deps/remark.ts";

function frontmatter(options: any) {
  var data = remark.data();
  add("micromarkExtensions", micromarkFrontmatter(options));
  add("fromMarkdownExtensions", frontmatterFromMarkdown(options));
  add("toMarkdownExtensions", frontmatterToMarkdown(options));
  function add(field: any, value: any) {
    if (data[field]) data[field].push(value);
    else data[field] = [value];
  }
}

export default frontmatter;
