import winston from "winston";
import { Logger, LogLevel } from "../../src/utils/Logger";

jest.mock("winston", () => {
  const actualWinston = jest.requireActual("winston");

  return {
    ...actualWinston,
    createLogger: jest.fn(() => ({
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    })),
    transports: {
      Console: jest.fn(),
      File: jest.fn(),
    },
    format: {
      combine: jest.fn((...formats) => formats),
      colorize: jest.fn(() => "colorize"),
      simple: jest.fn(() => "simple"),
      timestamp: jest.fn(() => "timestamp"),
      errors: jest.fn(() => "errors"),
      json: jest.fn(() => "json"),
      printf: jest.fn(() => "printf"),
    },
    addColors: jest.fn(),
  };
});

describe("Logger", () => {
  let logger: Logger;

  describe("Initialization", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      logger = Logger.getInstance(true);
    });

    it("should create a winston logger with the correct levels and transports", () => {
      expect(winston.createLogger).toHaveBeenCalledWith({
        levels: {
          error: 0,
          warn: 1,
          info: 2,
          debug: 3,
        },
        transports: expect.any(Array),
      });
    });

    it("should add colors to winston", () => {
      expect(winston.addColors).toHaveBeenCalledWith({
        error: "red",
        warn: "yellow",
        info: "green",
        debug: "cyan",
      });
    });

    it("should verify that this.logger[level] is a mock function", () => {
      const level = "error";
      expect(typeof logger["logger"][level]).toBe("function");
    });
  });

  describe("Transports", () => {
    beforeEach(() => {
      delete process.env.NODE_ENV;
      jest.clearAllMocks();
    });

    it("should include a Console transport in non-production environments", () => {
      process.env.NODE_ENV = "dev";
      logger = Logger.getInstance(true);

      expect(winston.transports.Console).toHaveBeenCalledWith({
        format: expect.anything(),
      });
    });

    it("should not include a Console transport in production environments", () => {
      process.env.NODE_ENV = "prod";
      logger = Logger.getInstance(true);

      expect(winston.transports.Console).not.toHaveBeenCalled();
    });
  });

  describe("Logging Methods", () => {
    const testMessage = "Test message";
    const logLevels: LogLevel[] = ["error", "warn", "info", "debug"];

    beforeEach(() => {
      jest.clearAllMocks();
      logger = Logger.getInstance(true);
    });

    it("should call the appropriate log level methods", () => {
      logLevels.forEach((level: LogLevel) => {
        const spy = jest.spyOn(logger["logger"], level);
        logger.log(level, testMessage);

        expect(spy).toHaveBeenCalledWith(testMessage, undefined);
      });
    });

    logLevels.forEach((level: LogLevel) => {
      it(`should call the ${level} method`, () => {
        const mockedLogMethod = (winston.createLogger as jest.Mock).mock.results[0].value[level];

        logger[level](testMessage);

        expect(mockedLogMethod).toHaveBeenCalledWith(testMessage, undefined);
      });

      it(`should call the ${level} method with meta data`, () => {
        const mockedLogMethod = (winston.createLogger as jest.Mock).mock.results[0].value[level];
        const meta = { key: "value" };

        logger[level](testMessage, meta);

        expect(mockedLogMethod).toHaveBeenCalledWith(testMessage, meta);
      });
    });
  });
});
