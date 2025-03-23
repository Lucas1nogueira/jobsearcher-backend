import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testTimeout: 20000,
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

export default config;
