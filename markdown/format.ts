import remark from "./remark.ts";
import plugins from "../plugins/mod.ts";

// formatting configuration
export default function format(markdown: string): string {
  let formatted = markdown;
  remark
    .use(plugins)
    .process(markdown, (err: any, file: any) => {
      if (err) throw err;
      formatted = String(file);
    });
  return formatted;
}
