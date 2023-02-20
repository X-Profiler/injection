module.exports = {
  verbose: true,
  silent: false,
  forceExit: true,
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: "./tsconfig.json",
      isolatedModules: true
    }]
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  testRegex: "/.+test/.+.(test|spec).(ts)",
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
};
