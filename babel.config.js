export default {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        targets: {node: '22.22.0'},
      },
    ],
  ],
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        useESModules: true,
      },
    ],
  ],
}
