import { remark } from "remark";

import "../docshim.ts";

import plugins from "../plugins/mod.ts";

let defaultRemark = remark();
for (const p of plugins) {
  defaultRemark = defaultRemark.use(p);
}
defaultRemark.freeze();

// formatting configuration
export default async function format(
  markdown: string,
  configuredRemark: typeof remark = defaultRemark,
): Promise<string> {
  const result = configuredRemark.process(markdown);
  if (!result) throw new Error("failed to format markdown");
  return String(await result);
}
