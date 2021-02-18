import colors from "../deps/colors.ts";
import { diffText } from "../deps/diff.ts";

/**
 * Prints coloured diff to console. Returns true if a diff was printed.
 */
export function outputDiff(expected: string, got: string): boolean {
  const parts = diffText(expected, got);
  let hasDiff = false;
  let diffString = "";
  parts.forEach((part) => {
    hasDiff = hasDiff || part.added || part.removed;
    const jsonValue = JSON.stringify(part.value);
    const escapedValue = jsonValue.substring(1, jsonValue.length - 1);
    diffString += part.added
      ? colors.bgGreen(escapedValue)
      : part.removed
      ? colors.bgRed(escapedValue)
      : colors.gray(part.value);
  });
  if (hasDiff) {
    console.log(diffString);
  }
  return hasDiff;
}
