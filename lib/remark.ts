// deno-lint-ignore-file no-explicit-any

import remarkImport from "remark";

export type VFile = {
  data: any;
  messages: any[];
  history: any[];
  cwd: string;
  contents: string;
};

// See https://github.com/remarkjs/remark/tree/main/packages/remark#use
export interface Remark {
  process: (
    content: string,
    processor: (err: any, file: VFile) => void,
  ) => string;
  use: (plugin: any) => Remark;
  data: () => any;
}

const remark = (remarkImport as any)() as Remark;
export default remark;
