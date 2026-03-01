export default {
  ignore: [
    '**/__snapshots__/**',
    '**/__tests__/**',
    '**/fixtures/**',
    '__tests__/**',
  ],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {node: '22.22.0'},
        modules: false,
      },
    ],
  ],
}
