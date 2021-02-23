import { expandGlob } from "./deps/fs.ts";

interface DevEnv {
  // readable metadata
  revision: string;

  // workspace information
  commit: string;
  tag?: string;
  dirty: boolean;
  deno: { deno: string; v8: string; typescript: string };

  // make indexable
  [k: string]: any;
}

async function getDevEnv(): Promise<DevEnv> {
  const revparse = Deno.run({
    cmd: ["git", "rev-parse", "--short", "HEAD"],
    stdout: "piped",
  });
  const commit = new TextDecoder().decode(await revparse.output()).trim();
  revparse.close();

  const namerev = Deno.run({
    cmd: ["git", "name-rev", "--tags", "--name-only", commit],
    stdout: "piped",
  });
  const tag = new TextDecoder().decode(await namerev.output()).trim();
  namerev.close();

  const diff = Deno.run({ cmd: ["git", "diff", "--quiet"] });
  const { code: diffStatus } = await diff.status();

  const env = {
    commit,
    tag: tag !== "undefined" ? tag : undefined,
    dirty: !!diffStatus,
    deno: Deno.version,
  };

  return {
    ...env,
    revision: `${env.tag || env.commit}${env.dirty ? "-dirty" : ""}`,
  };
}

interface DevScripts {
  [k: string]: (args: string[], env: DevEnv) => Promise<void>;
}

const helpCommand = "help";

const devScripts: DevScripts = {
  [helpCommand]: async () => {
    console.log("READABLE DEV TOOL");
    console.log("=================");
    console.log(`Available commands:\n`);
    for (const command of Object.keys(devScripts)) {
      console.log(`  ${command}`);
    }
    console.log();
    console.log(
      "For more help, refer to https://github.com/bobheadxi/readable/blob/main/CONTRIBUTING.md",
    );
  },
  "env": async (args, env) => {
    if (args.length === 0) {
      console.log(env);
    } else {
      console.log(env[args[0]]);
    }
  },
  /**
   * Checks to run before commit.
   * 
   * @param args directories
   */
  "precommit": async (args, env) => {
    for (const command of ["fmt", "test"]) {
      console.log(`>>> ${command}`);
      await devScripts[command](args, env);
    }
  },
  /**
   * Run formatter.
   * 
   * @param args 'check' as first to check, rest are directories
   */
  "fmt": async (args, env) => {
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
    // Dogfood readable formatting
    await devScripts["readable"]([check ? "check" : "fmt", "**/*.md"], env);
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
  "upgrade": async (args) => {
    if (args.length !== 3) {
      throw new Error(`requires arguments [target] [previous] [next]`);
    }
    const [target, previous, next] = args;
    console.log(`Upgrading ${target} from ${previous} to ${next}`);
    switch (target) {
      case "deno":
        const files = ["./.github/workflows/pipeline.yml", "./Dockerfile"];
        for (const f of files) {
          const content = await Deno.readTextFile(f);
          await Deno.writeTextFile(f, content.replaceAll(previous, next));
        }
        break;
      default:
        throw new Error(`unknown target ${target}`);
    }
  },
  "build": async (args, env) => {
    if (args.length !== 1) {
      throw new Error(`requires argument [target]`);
    }
    const [target] = args;
    console.log(`Building ${target} @ ${env.revision}`);
    if (env.dirty) {
      console.warn("Warning: building dirty commit");
    }
    switch (target) {
      case "docker":
        const p = Deno.run({
          cmd: [
            "docker",
            "build",
            "-t",
            `bobheadxi/readable:${env.revision}`,
            ".",
          ],
        });
        const { code } = await p.status();
        if (code) {
          throw new Error(`command failed with status ${code}`);
        }
        break;
      default:
        throw new Error(`unknown target ${target}`);
    }
  },
};

if (import.meta.main) {
  const env = await getDevEnv();
  const command = Deno.args[0] || helpCommand;
  const scriptArgs = [...Deno.args].splice(1);
  const runScript = devScripts[command];
  if (!runScript) {
    await devScripts[helpCommand](scriptArgs, env);
    console.error(`Command '${command}' not found`);
    Deno.exit(1);
  }
  await runScript(scriptArgs, env);
}

export default devScripts;
