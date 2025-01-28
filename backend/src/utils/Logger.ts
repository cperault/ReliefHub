import winston from "winston";

export type LogLevel = "error" | "warn" | "info" | "debug";

export interface LogLevels {
  levels: Record<LogLevel, number>;
  colors: Record<LogLevel, string>;
}

export class Logger {
  private static instance: Logger | null = null;
  private logger: winston.Logger;

  private logLevels: LogLevels = {
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
  };

  private constructor() {
    this.logger = winston.createLogger({
      levels: this.logLevels.levels,
      transports: this.getTransports(),
    });

    winston.addColors(this.logLevels.colors);
  }

  public static getInstance(reset: boolean = false): Logger {
    if (reset || !this.instance) {
      this.instance = new Logger();
    }

    return this.instance;
  }

  public static resetInstance(): void {
    this.instance = null;
  }

  private getTransports() {
    const env = process.env.NODE_ENV || "dev";
    const transports: winston.transport[] = [];

    if (env !== "prod" && env !== "test") {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.errors({ stack: env === "dev" }),
            winston.format.printf(({ timestamp, level, message, stack }) => {
              return `${timestamp} ${level}: ${message}${stack ? "\n" + stack : ""}`;
            })
          ),
        })
      );
    }

    transports.push(
      new winston.transports.File({
        filename: "logs/error.log",
        level: "error",
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: false }),
          winston.format.json()
        ),
      }),
      new winston.transports.File({
        filename: "logs/combined.log",
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      })
    );

    return transports;
  }

  public log(level: LogLevel, message: string, meta?: any): void {
    this.logger[level](message, meta);
  }

  public error(message: string, meta?: any): void {
    this.log("error", message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.log("warn", message, meta);
  }

  public info(message: string, meta?: any): void {
    this.log("info", message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.log("debug", message, meta);
  }
}
