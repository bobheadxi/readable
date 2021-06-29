import remarkImport from "https://jspm.dev/remark@13.0.0";
import { VFile } from "./vfile.ts";

// See https://github.com/remarkjs/remark/tree/main/packages/remark#use
export interface Remark {
  process: (
    content: string | VFile,
    processor: (err: any, file: VFile) => void,
  ) => string;
  use: (plugin: any) => Remark;
  data: () => any;
}

const remark = (remarkImport as any)() as Remark;
export default remark;
