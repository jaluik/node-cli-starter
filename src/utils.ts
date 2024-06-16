import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';
import { PackageJsonType, PackageManagerType, TechStackType } from './types';
import ora from 'ora';

const spinner = ora();

export function getPackageJson(): PackageJsonType {
  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    spinner.fail('package.json not found');
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  return packageJson;
}

/**
 * 获取包的版本号
 * @param packageName 包的名称
 * @param packageManager 包管理工具（npm、yarn 或 pnpm）
 * @returns 包的版本号
 */
export const getPackageVersion = (
  packageName: string,
  packageManager: 'npm' | 'yarn' | 'pnpm',
): string | null => {
  try {
    let version: string;

    switch (packageManager) {
      case 'npm':
        version = execSync(
          `npm list ${packageName} --depth=0 --json`,
        ).toString();
        return JSON.parse(version).dependencies[packageName].version;

      case 'yarn':
        version = execSync(
          `yarn list --pattern ${packageName} --depth=0 --json`,
        ).toString();
        const yarnData = JSON.parse(version);
        return yarnData.data.trees[0].name.split('@')[1];

      case 'pnpm':
        version = execSync(
          `pnpm list ${packageName} --depth=0 --json`,
        ).toString();
        const pnpmData = JSON.parse(version);
        return pnpmData[0].dependencies[packageName].version;

      default:
        throw new Error('Unsupported package manager');
    }
  } catch (error) {
    console.error(`Error fetching version for package ${packageName}:`, error);
    return null;
  }
};

export function detectPackageManager(): PackageManagerType {
  if (fs.existsSync(path.resolve(process.cwd(), 'yarn.lock'))) {
    return 'yarn';
  } else if (fs.existsSync(path.resolve(process.cwd(), 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }
  return 'npm';
}

export function detectTechStack(packageJson: PackageJsonType): {
  techStack: TechStackType;
  version?: string;
} {
  let techStack: TechStackType = 'unknown';
  if (packageJson.dependencies?.react || packageJson.devDependencies?.react) {
    techStack = 'react';
  } else if (packageJson.dependencies.vue || packageJson.devDependencies.vue) {
    techStack = 'vue';
  }
  if (techStack === 'unknown') {
    return { techStack };
  }
  const packageManager = detectPackageManager();
  const version = getPackageVersion('react', packageManager);

  return { techStack, version };
}

export function installJest(packageManager: PackageManagerType): void {
  const installCommand = {
    npm: 'npm install --save-dev jest',
    yarn: 'yarn add --dev jest',
    pnpm: 'pnpm add --save-dev jest',
  };

  execSync(installCommand[packageManager], { stdio: 'inherit' });
}

export function writeJestConfig(): void {
  const jestConfigPath = path.resolve(process.cwd(), 'jest.config.js');
  const templatePath = path.resolve(__dirname, 'jest.config.template.js');
  fs.copyFileSync(templatePath, jestConfigPath);
}

export function updatePackageJsonScripts(obj: Record<string, string>) {
  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  const packageJson = getPackageJson();

  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts = {
    ...packageJson.scripts,
    ...obj,
  };

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  spinner.succeed('Updated package.json scripts with "test: jest"');
}
