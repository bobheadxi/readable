import remark from "./remark.ts";

// remark plugins
import remarkPlugins from "../plugins/remark/mod.ts";

// custom plugins
import reflowParagraphs from "../plugins/reflowParagraphs.ts";

// formatting configuration
export default function format(markdown: string): string {
  let formatted = markdown;
  remark
    .use(remarkPlugins.gfm)
    .use(remarkPlugins.frontmatter)
    .use(remarkPlugins.math)
    .use(reflowParagraphs)
    .use(remarkPlugins.stringify)
    .process(markdown, (err: any, file: any) => {
      if (err) throw err;
      formatted = String(file);
    });
  return formatted;
}
