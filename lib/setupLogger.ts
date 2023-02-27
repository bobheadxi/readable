import { handlers, LevelName, LogRecord, setup } from "log/mod.ts";

export default async function setupLogger(level?: LevelName) {
  const baseLogger = {
    level: level || "WARNING",
    handlers: ["console"],
  };
  await setup({
    handlers: {
      console: new handlers.ConsoleHandler("DEBUG", {
        formatter: (r: LogRecord) => {
          let msg = `${r.levelName}${
            r.loggerName !== "default" ? ` ${r.loggerName}:` : ""
          } ${r.msg}`;

          r.args.forEach((arg) => {
            msg += `, ${JSON.stringify(arg)}`;
          });

          return msg;
        },
      }),
    },
    loggers: {
      default: baseLogger,
      fmt: baseLogger,
      check: baseLogger,
      reflow: baseLogger,
    },
  });
}
