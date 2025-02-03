import { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  maxConcurrency: 1,
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  testEnvironmentOptions: {
    NODE_OPTIONS: "--no-warnings",
  },
};

export default config;
