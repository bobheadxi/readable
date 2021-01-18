import remark from "./remark.ts";

// formatting configuration
export default function format(markdown: string): string {
  let formatted = markdown;
  remark.process(markdown, (err: any, file: any) => {
      if (err) throw err;
      formatted = String(file);
    });
  return formatted;
}
