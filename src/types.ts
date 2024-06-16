export type TechStackType = 'react' | 'vue' | 'unknown';

export type PackageManagerType = 'npm' | 'pnpm' | 'yarn';

export type PackageJsonType = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
};
