import winston, { format } from "winston";
import path from "path";

export type LogLevel = "error" | "warn" | "info" | "debug";
export type LogMeta = Record<string, unknown> | Error | unknown;

interface LogConfig {
  env: string;
  logDir: string;
  consoleLevel: LogLevel;
  fileLevel: LogLevel;
}

const DEFAULT_CONFIG: LogConfig = {
  env: process.env.NODE_ENV || "dev",
  logDir: path.join(process.cwd(), "logs"),
  consoleLevel: "debug",
  fileLevel: "info",
} as const;

export class Logger {
  private static instance: Logger;
  private logger: winston.Logger;

  private static readonly LOG_LEVELS = {
    levels: {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    },
    colors: {
      error: "red",
      warn: "yellow",
      info: "green",
      debug: "cyan",
    },
  } as const;

  private constructor(private config: LogConfig = DEFAULT_CONFIG) {
    this.logger = winston.createLogger({
      levels: Logger.LOG_LEVELS.levels,
      transports: this.createTransports(),
    });

    winston.addColors(Logger.LOG_LEVELS.colors);
  }

  public static getInstance = (config?: Partial<LogConfig>): Logger => {
    if (!Logger.instance) {
      Logger.instance = new Logger({
        ...DEFAULT_CONFIG,
        ...config,
      });
    }
    return Logger.instance;
  };

  private createConsoleFormat = (): winston.Logform.Format => {
    return format.combine(
      format.colorize(),
      format.timestamp(),
      format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : "";
        return `${timestamp} [${level}]: ${message}${metaStr}`;
      })
    );
  };

  private createFileFormat = (): winston.Logform.Format => {
    return format.combine(format.timestamp(), format.errors({ stack: true }), format.json());
  };

  private createTransports = (): winston.transport[] => {
    const transports: winston.transport[] = [];

    // For unit tests without Cypress, use silent console transport
    if (this.config.env === "test" && !process.env.CYPRESS) {
      return [new winston.transports.Console({ silent: true })];
    }

    // Console transport for development and Cypress tests
    if (this.config.env === "test" || this.config.env === "dev") {
      transports.push(
        new winston.transports.Console({
          level: this.config.consoleLevel,
          format: this.createConsoleFormat(),
        })
      );
    }

    // File transports for production
    if (this.config.env === "prod") {
      transports.push(
        new winston.transports.File({
          filename: path.join(this.config.logDir, "error.log"),
          level: "error",
          format: this.createFileFormat(),
        }),
        new winston.transports.File({
          filename: path.join(this.config.logDir, "combined.log"),
          level: this.config.fileLevel,
          format: this.createFileFormat(),
        })
      );
    }

    return transports;
  };

  public log = (level: LogLevel, message: string, meta?: LogMeta): void => {
    if (meta instanceof Error) {
      this.logger[level](message, {
        error: {
          name: meta.name,
          message: meta.message,
          stack: meta.stack,
        },
      });
    } else {
      this.logger[level](message, meta);
    }
  };

  public error = (message: string, meta?: LogMeta): void => {
    this.log("error", message, meta);
  };

  public warn = (message: string, meta?: LogMeta): void => {
    this.log("warn", message, meta);
  };

  public info = (message: string, meta?: LogMeta): void => {
    this.log("info", message, meta);
  };

  public debug = (message: string, meta?: LogMeta): void => {
    this.log("debug", message, meta);
  };

  // For testing purposes only
  public static resetInstance = (): void => {
    Logger.instance = undefined as any;
  };
}
