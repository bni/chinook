const jestConfig = {
  preset: "ts-jest",
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.(t|j)sx?$": ["ts-jest", { useESM: true } ]
  },
  roots: ["<rootDir>"],
  moduleNameMapper: {
    "@lib/(.*)$": "<rootDir>/lib/$1",
    "@components/(.*)$": "<rootDir>/components/$1"
  }
};

export default jestConfig;
