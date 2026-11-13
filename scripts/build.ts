import { cp, mkdir, rm } from 'node:fs/promises';

const source = new URL('../src/', import.meta.url);
const destination = new URL('../dist/', import.meta.url);

const excluded = [
  /\.(test|spec)\.(js|mjs|cjs)$/,
  /\.snap$/,
  /(^|\/)__tests?(?:__|\/)/,
  /(^|\/)__snapshots__\//,
  /(^|\/)__fixtures__\//,
];

await rm(destination, { recursive: true, force: true });

await mkdir(destination, { recursive: true });

await cp(source, destination, {
  recursive: true,
  filter: (src) => {
    const relativePath = src.replaceAll('\\', '/').replace(/^.*\/src\//, '');

    return !excluded.some((pattern) => pattern.test(relativePath));
  },
});
