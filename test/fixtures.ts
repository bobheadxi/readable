const fixture0 = `# Lorem ipsum

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
`;

const fixture1 = `---
field: wow
---

# Document

hello world! this is a document.
here is a sentence. and here is another \`sentence\`! with **emphasis** and *italics* and ~strike~ and the end of a sentence.

And here is another paragraph.
`;

const fixture2 = `
# Document

hello world! this is a document.
here is a sentence. and here is another \`sentence\`!
with a [a link](https://bobheadxi.dev) and **emphasis [bold link](https://github.com/bobheadxi)** and *italics* and ~strike~
and a ![cute image](https://bobheadxi.dev/assets/images/profile.jpg).
`;

const fixtureSet: { [name: string]: string } = {
  fixture0,
  fixture1,
  fixture2,
};

export default fixtureSet;
