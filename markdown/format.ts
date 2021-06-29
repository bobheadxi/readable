import remark, { Remark } from "../deps/remark.ts";
import { VFile } from "../deps/vfile.ts";

import plugins from "../plugins/mod.ts";

let defaultRemark = remark;
for (const p of plugins) {
  defaultRemark = defaultRemark.use(p);
}

// formatting configuration
export default function format(
  markdown: string | VFile,
  configuredRemark: Remark = defaultRemark,
): string {
  let formatted = String(markdown);
  configuredRemark.process(markdown, (err, file) => {
    if (err) throw err;
    formatted = String(file);
  });
  return formatted;
}
