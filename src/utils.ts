import * as fs from 'fs-extra';
import * as path from 'path';
import { PackageJsonType, PackageManagerType, TechStackType } from './types';
import sharedVars from './sharedVars';
import ora from 'ora';
import { spawn } from 'child_process';

const spinner = ora();

const { getBasePath } = sharedVars;

const execAsync = (command: string, options = {}): Promise<string> => {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, {
      shell: true,
      stdio: 'inherit',
      cwd: getBasePath(),
      ...options,
    });

    let output = '';

    proc.stdout?.on('data', (data) => {
      output += data.toString();
    });

    proc.stderr?.on('data', (data) => {
      output += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
};

export async function getPackageJson(): Promise<PackageJsonType> {
  const packageJsonPath = path.resolve(getBasePath(), 'package.json');
  if (!(await fs.pathExists(packageJsonPath))) {
    spinner.fail('package.json not found');
    process.exit(1);
  }

  const packageJson: PackageJsonType = await fs.readJSON(packageJsonPath);
  return packageJson;
}

/**
 * 获取包的版本号
 * @param packageName 包的名称
 * @param packageManager 包管理工具（npm、yarn 或 pnpm）
 * @returns 包的版本号
 */
export const getPackageVersion = async (
  packageName: string,
  packageManager: 'npm' | 'yarn' | 'pnpm',
): Promise<string | null> => {
  try {
    let version: string;

    switch (packageManager) {
      case 'npm':
        version = await execAsync(`npm list ${packageName} --depth=0 --json`, {
          stdio: undefined,
        });
        return JSON.parse(version).dependencies[packageName].version;

      case 'yarn':
        version = await execAsync(
          `yarn list --pattern ${packageName} --depth=0 --json`,
          {
            stdio: undefined,
          },
        );
        const yarnData = JSON.parse(version);
        return yarnData.data.trees[0].name.split('@')[1];

      case 'pnpm':
        version = await execAsync(`pnpm list ${packageName} --depth=0 --json`, {
          stdio: undefined,
        });

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

export async function detectPackageManager(): Promise<PackageManagerType> {
  if (await fs.pathExists(path.resolve(getBasePath(), 'yarn.lock'))) {
    return 'yarn';
  } else if (
    await fs.pathExists(path.resolve(getBasePath(), 'pnpm-lock.yaml'))
  ) {
    return 'pnpm';
  }
  return 'npm';
}

export async function detectTechStack(packageJson: PackageJsonType): Promise<{
  techStack: TechStackType;
  version?: string;
}> {
  let techStack: TechStackType = 'unknown';
  if (packageJson.dependencies?.react || packageJson.devDependencies?.react) {
    techStack = 'react';
  } else if (packageJson.dependencies.vue || packageJson.devDependencies.vue) {
    techStack = 'vue';
  }
  if (techStack === 'unknown') {
    return { techStack };
  }
  const packageManager = await detectPackageManager();
  const version = await getPackageVersion('react', packageManager);

  return { techStack, version };
}

export const installAllDependencies = async () => {
  const packageManager = await detectPackageManager();
  await execAsync(`${packageManager} install`, {
    cwd: getBasePath(),
  });
  return;
};

export async function installJest(
  packageManager: PackageManagerType,
): Promise<void> {
  const installCommand = {
    npm: 'npm install --save-dev jest',
    yarn: 'yarn add --dev jest',
    pnpm: 'pnpm add --save-dev jest',
  };

  await execAsync(installCommand[packageManager], {
    cwd: getBasePath(),
  });
}

export async function writeJestConfig(): Promise<void> {
  const jestConfigPath = path.resolve(getBasePath(), 'jest.config.js');
  const templatePath = path.resolve(__dirname, '../template/jest.config.js');
  await fs.copy(templatePath, jestConfigPath);
}

export async function updatePackageJsonScripts(
  obj: Record<string, string>,
): Promise<void> {
  const packageJsonPath = path.resolve(getBasePath(), 'package.json');
  const packageJson = await getPackageJson();

  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts = {
    ...packageJson.scripts,
    ...obj,
  };

  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
}
