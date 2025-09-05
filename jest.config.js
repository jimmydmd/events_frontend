module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  transformIgnorePatterns: ["node_modules/(?!(axios)/)"],
  setupFilesAfterEnv: ["@testing-library/jest-dom", "<rootDir>/src/setupTests.js"],
};
