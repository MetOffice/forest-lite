module.exports = {
    setupFiles: ["jest-canvas-mock", "./jest.setup.js"],
    transformIgnorePatterns: [
    ],
    moduleNameMapper: {
      "\\.css$": "identity-obj-proxy"
    },
    watchPathIgnorePatterns: [
        "node_modules"
    ]
}
