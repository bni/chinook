const jestConfig = {
  testEnvironment: "node",
  preset: "ts-jest",
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest"
  },
  roots: ["<rootDir>"],
  moduleNameMapper: {
    "@lib/(.*)$": "<rootDir>/lib/$1"
  }
};

export default jestConfig;
