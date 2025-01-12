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

    if (env !== "prod") {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        })
      );
    }

    transports.push(new winston.transports.File({ filename: "logs/error.log", level: "error" }));

    return transports;
  }

  public log(level: LogLevel, message: string): void {
    this.logger[level](message);
  }

  public error(message: string): void {
    this.log("error", message);
  }

  public warn(message: string): void {
    this.log("warn", message);
  }

  public info(message: string): void {
    this.log("info", message);
  }

  public debug(message: string): void {
    this.log("debug", message);
  }
}
