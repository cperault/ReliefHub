import { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/src/tests/__mocks__/fileMock.js",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$",
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
  maxConcurrency: 1,
  testPathIgnorePatterns: ["/node_modules/", "/build/", "/dist/"],
  testEnvironmentOptions: {
    RUN_OPTIONS: "--no-warnings",
  },
  collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx}", "!src/**/*.d.ts", "!src/main.tsx", "!src/vite-env.d.ts"],
};

export default config;
