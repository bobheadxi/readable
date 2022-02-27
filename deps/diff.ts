import { diffWordsWithSpace } from "https://cdn.skypack.dev/diff@5";

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
