import remarkImport from "https://jspm.dev/remark@13";

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
