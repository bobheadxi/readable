import remark, { Remark } from "../deps/remark.ts";

import plugins from "../plugins/mod.ts";

let defaultRemark = remark;
for (const p of plugins) {
  defaultRemark = defaultRemark.use(p);
}

// formatting configuration
export default function format(
  markdown: string,
  configuredRemark: Remark = defaultRemark,
): string {
  let formatted = markdown;
  configuredRemark.process(markdown, (err, file) => {
    if (err) throw err;
    formatted = String(file);
  });
  return formatted;
}
