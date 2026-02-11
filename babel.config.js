module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {node: '22.22.0'},
        modules: 'commonjs',
      },
    ],
  ],
  plugins: ['@babel/plugin-transform-runtime'],
}
