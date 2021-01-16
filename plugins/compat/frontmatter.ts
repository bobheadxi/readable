// CDN distributions of this remark-frontmatter does not seem to work, so adapt from
//

import syntax from "https://jspm.dev/micromark-extension-frontmatter";
import {
  fromMarkdown,
  toMarkdown,
} from "https://jspm.dev/mdast-util-frontmatter";
import { remark } from "../../mod.ts";

function frontmatter(options: any) {
  var data = remark.data();
  add("micromarkExtensions", (syntax as any)(options));
  add("fromMarkdownExtensions", (fromMarkdown as any)(options));
  add("toMarkdownExtensions", (toMarkdown as any)(options));
  function add(field: any, value: any) {
    if (data[field]) data[field].push(value);
    else data[field] = [value];
  }
}

export default frontmatter;
