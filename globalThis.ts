import { DOMParser, HTMLDocument } from "deno_dom/deno-dom-wasm.ts";

/**
 * Workaround for document reference error during parsing.
 */
// deno-lint-ignore prefer-namespace-keyword
declare module globalThis {
  // deno-lint-ignore no-var
  var document: HTMLDocument;
}

const parser = new DOMParser();
const doc = parser.parseFromString("<html></html>", "text/html");
globalThis.document = doc!;
