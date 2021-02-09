import { diffWordsWithSpace } from "https://jspm.dev/diff@5.0.0";

export const diffText = diffWordsWithSpace as (
  oldStr: string,
  newStr: string,
) => Parts;

export interface Part {
  value: string;
  added: boolean;
  removed: boolean;
}

export type Parts = Part[];
