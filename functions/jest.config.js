/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  // Set emulator env vars before any module is imported
  setupFiles: ["<rootDir>/src/__tests__/setupEmulator.ts"],
  // Allow time for emulator round-trips
  testTimeout: 20000,
  // Use ts-jest with the functions tsconfig but include test files
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          module: "commonjs",
          target: "es2019",
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          noUnusedLocals: false,
        },
      },
    ],
  },
};
