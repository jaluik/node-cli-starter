import { defineConfig } from 'tsup';
import packageJson from './package.json';

export default defineConfig((option) => ({
  entry: ['src/index.ts'],
  format: 'cjs',
  outDir: 'bin',
  minify: !option.watch,
  target: 'node16',
  treeshake: true,
  splitting: false,
  clean: true,
  env: {
    NAME: packageJson.name,
    DESCRIPTION: packageJson.description,
    VERSION: packageJson.version,
  },
}));
