import ora from 'ora';
import {
  getPackageJson,
  detectTechStack,
  detectPackageManager,
  installJest,
  writeJestConfig,
} from './utils';
import sharedVars from './sharedVars';

const { setBasePath } = sharedVars;

async function init(path: string) {
  setBasePath(path);
  const spinner = ora('分析项目中...').start();

  try {
    const packageJson = getPackageJson();

    spinner.text = '检测技术栈...';
    const techStack = detectTechStack(packageJson);
    if (techStack.techStack === 'unknown') {
      throw new Error('未检测到技术栈。请确保您在一个 React 或 Vue 项目中。');
    }
    spinner.succeed(`检测到的技术栈: ${techStack}`);

    spinner.start('检测包管理器...');
    const packageManager = detectPackageManager();
    spinner.succeed(`检测到的包管理器: ${packageManager}`);

    spinner.start('安装 Jest...');
    installJest(packageManager);
    spinner.succeed('Jest 安装成功。');

    spinner.start('写入 Jest 配置...');
    writeJestConfig();
    spinner.succeed('Jest 配置写入成功。');
  } catch (error) {
    spinner.fail(`操作失败: ${(error as Error).message}`);
  }
}

export default init;
