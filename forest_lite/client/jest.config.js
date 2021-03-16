module.exports = {
    setupFiles: ["jest-canvas-mock", "./jest.setup.js"],
    transformIgnorePatterns: [
    ],
    moduleNameMapper: {
      "\\.(css|scss)$": "<rootDir>/src/mocks/styleMock.js",
      "\\.(png|svg|pdf|jpg|jpeg)$": "<rootDir>/src/mocks/fileMock.js",
      "\\worker.js$": "<rootDir>/src/mocks/workerMock.js",
    },
    watchPathIgnorePatterns: [
        "node_modules"
    ]
}
