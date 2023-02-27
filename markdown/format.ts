import "./docshim.ts"

import { remark, Remark } from "../lib/remark.ts";

import plugins from "../plugins/mod.ts";

let defaultRemark = remark;
for (const p of plugins) {
  defaultRemark = defaultRemark.use(p);
}

// formatting configuration
export default async function format(
  markdown: string,
  configuredRemark: Remark = defaultRemark,
): Promise<string> {
  const file = await configuredRemark.process(markdown);
  return String(file);
}
