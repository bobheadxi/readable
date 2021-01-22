import plugins from "../plugins/mod.ts";

import remarkImport from "https://jspm.dev/remark@13.0.0";
let remark = (remarkImport as any)();

for (const p of plugins) {
  remark = remark.use(p);
}

export default remark;
