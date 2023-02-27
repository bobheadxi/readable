import { DOMParser } from "https://esm.sh/linkedom";

// https://deno.land/manual@v1.31.1/advanced/jsx_dom/deno_dom

const document = new DOMParser().parseFromString(
  `<!DOCTYPE html>
  <html lang="en">
    <head>
      <title>Hello from Deno</title>
    </head>
    <body>
      <h1>Hello from Deno</h1>
      <form>
        <input name="user">
        <button>
          Submit
        </button>
      </form>
    </body>
  </html>`,
  "text/html",
);

globalThis.document = document as any;
