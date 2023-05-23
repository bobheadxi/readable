// deno-lint-ignore-file no-explicit-any

import { remark } from "remark";

// See https://github.com/remarkjs/remark/tree/main/packages/remark#use
export interface Remark {
  process: (
    content: string,
    callback?: any,
  ) => Promise<any> | undefined;
  use: (plugin: any) => Remark;
  data: (key: any, value: any) => any;
}

export { remark };
