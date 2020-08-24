// babel.config.js
module.exports = api => {
  const isTest = api.env('test')
  if (!isTest) {
      return {}
  }
  return { presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: 'current',
          },
        },
      ],
        "@babel/preset-react"
    ],
    plugins: [
      "transform-es2015-modules-commonjs",
        "@babel/plugin-proposal-export-namespace-from"
    ]
  };
}

