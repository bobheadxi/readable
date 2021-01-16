import { remark } from "../mod.ts";

// remark plugins
import remarkGFM from "https://cdn.skypack.dev/remark-gfm@1.0.0";
import remarkMath from "https://cdn.skypack.dev/remark-math@4.0.0";
import remarkFrontmatter from "../plugins/compat/frontmatter.ts";

// custom plugins
import reflowParagraphs from "../plugins/reflowParagraphs.ts";

// formatting configuration
export default function format(markdown: string): string {
  let formatted = markdown;
  remark
    .use(remarkGFM)
    .use(remarkFrontmatter)
    .use(remarkMath)
    .use(reflowParagraphs)
    .use({
      // https://github.com/syntax-tree/mdast-util-to-markdown#formatting-options
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
        strong: true,
      },
    })
    .process(markdown, (err: any, file: any) => {
      if (err) throw err;
      formatted = String(file);
    });
  return formatted;
}
