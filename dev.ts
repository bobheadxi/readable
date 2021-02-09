#!/usr/bin/env deno run --unstable --allow-all

import { expandGlob } from "./deps/fs.ts";

interface DevScripts {
  [k: string]: (args: string[]) => Promise<void>;
}

const devScripts: DevScripts = {
  "help": async () => {
    console.log(`Available commands:\n`);
    for (const command of Object.keys(devScripts)) {
      console.log(`\t${command}`);
    }
  },
  /**
   * Checks to run before commit.
   * 
   * @param args directories
   */
  "precommit": async (args) => {
    for (const command of ["fmt", "test"]) {
      console.log(`>>> ${command}`);
      await devScripts[command](args);
    }
  },
  /**
   * Run formatter.
   * 
   * @param args 'check' as first to check, rest are directories
   */
  "fmt": async (args) => {
    const check = args ? args[0] === "check" : false;
    const dir = check ? args[1] : args[0];
    const cmd = ["deno", "fmt"];
    if (check) {
      cmd.push("--check");
    } else {
      cmd.push("--quiet");
    }
    // 'deno fmt' does not have glob support yet: https://github.com/denoland/deno/issues/6365
    // so we implement our own. this is required because 'deno fmt' now formats markdown,
    // which I don't want.
    const globPattern = `${dir ? `${dir}/` : ""}**/*.ts`;
    console.log(`${check ? "Checking" : "Formatting"} '${globPattern}'`);
    for await (const f of expandGlob(globPattern)) {
      if (!f.name.endsWith(".ts")) continue;
      const p = Deno.run({ cmd: [...cmd, f.path] });
      const { code } = await p.status();
      if (code) {
        throw new Error(`fmt exited with status ${code} on file ${f.path}`);
      }
    }
  },
  /**
   * Run tests.
   * 
   * @param args directories
   */
  "test": async (args) => {
    const p = Deno.run({ cmd: ["deno", "test", ...args] });
    const { code } = await p.status();
    if (code) {
      throw new Error(`test exited with status ${code}`);
    }
  },
  /**
   * Run readable.
   * 
   * @param args 'install' as first to install, otherwise 'readable' arguments
   */
  "readable": async (args) => {
    const install = args ? args[0] === "install" : false;
    const target = ["./readable.ts"];
    if (!install) {
      target.push(...args);
    }
    const cmd = [
      "deno",
      install ? "install" : "run",
      "--unstable",
      "--allow-read",
      "--allow-write",
    ];
    if (install) {
      cmd.push("--force"); // force install
    }
    const p = Deno.run({ cmd: [...cmd, ...target] });
    const { code } = await p.status();
    if (code) {
      throw new Error(`readable exited with status ${code}`);
    }
  },
};

if (import.meta.main) {
  console.debug("Deno", Deno.version);
  const script = Deno.args[0];
  const run = devScripts[script];
  if (!run) {
    console.error(`script '${script}' not found`);
    Deno.exit(1);
  }
  await run([...Deno.args].splice(1));
}

export default devScripts;
