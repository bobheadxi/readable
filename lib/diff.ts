import { bgGreen, bgRed, gray } from "fmt/colors.ts";
import { Logger } from "log/mod.ts";
import { diffWordsWithSpace } from "diff";

export const diffText = diffWordsWithSpace as (
  oldStr: string,
  newStr: string,
) => Parts;

interface Part {
  value: string;
  added: boolean;
  removed: boolean;
}

type Parts = Part[];

/**
 * Prints coloured diff to console. Returns true if a diff is found.
 *
 * @param expected expected string
 * @param got got string
 * @param options configure behaviour of diff
 */
export function diff(
  expected: string,
  got: string,
  options: { log: Logger | undefined } = { log: undefined },
): boolean {
  const parts = diffText(expected, got);
  let hasDiff = false;
  let diffString = "";
  parts.forEach((part) => {
    hasDiff = hasDiff || part.added || part.removed;
    const escapedValue = escapeContent(part.value);
    diffString += part.added
      ? bgGreen(escapedValue)
      : part.removed
      ? bgRed(escapedValue)
      : gray(part.value);
  });
  if (hasDiff && options?.log) {
    options.log.info(diffString);
  }
  return hasDiff;
}

export function escapeContent(content: string) {
  const jsonValue = JSON.stringify(content);
  return jsonValue.substring(1, jsonValue.length - 1);
}
