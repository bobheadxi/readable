import remark from "../deps/remark.ts";

import plugins from "../plugins/mod.ts";

let configuredRemark = remark;
for (const p of plugins) {
  configuredRemark = configuredRemark.use(p);
}

// formatting configuration
export default function format(markdown: string): string {
  let formatted = markdown;
  configuredRemark.process(markdown, (err, file) => {
    if (err) throw err;
    formatted = String(file);
  });
  return formatted;
}
