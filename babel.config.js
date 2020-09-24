module.exports = {
  presets: [
    [
      'next/babel',
      {
        'preset-env': {
          useBuiltIns: 'usage',
          corejs: 3,
          // loose: true,
        },
      },
    ],
    // [
    //   '@babel/typescript',
    //   {
    //     transformers: ['fireschema/transformer'],
    //   },
    // ],
    '@emotion/babel-preset-css-prop',
  ],
  plugins: [
    'emotion',
    // '@babel/plugin-proposal-optional-chaining',
    // '@babel/plugin-proposal-nullish-coalescing-operator',
  ],
}
