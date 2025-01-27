import { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  maxConcurrency: 1,
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  setupFiles: ["<rootDir>/jest.setup.ts"],
  testEnvironmentOptions: {
    NODE_OPTIONS: "--no-warnings",
  },
};

export default config;
