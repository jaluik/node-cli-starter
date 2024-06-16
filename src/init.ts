import ora from 'ora';
import {
  getPackageJson,
  detectTechStack,
  detectPackageManager,
  installJest,
  writeJestConfig,
  installAllDependencies,
  updatePackageJsonScripts,
} from './utils';
import sharedVars from './sharedVars';

const { setBasePath } = sharedVars;

async function init(path: string) {
  setBasePath(path);
  const spinner = ora('分析项目中...').start();

  try {
    const packageJson = await getPackageJson();
    spinner.info('安装依赖...');

    await installAllDependencies();
    spinner.succeed('安装依赖成功。');

    spinner.text = '检测技术栈...';
    const techStack = await detectTechStack(packageJson);
    if (techStack.techStack === 'unknown') {
      throw new Error('未检测到技术栈。请确保您在一个 React 或 Vue 项目中。');
    }
    spinner.succeed(
      `检测到的技术栈: ${techStack.techStack}，版本为：${techStack.version}`,
    );

    spinner.start('检测包管理器...');
    const packageManager = await detectPackageManager();
    spinner.succeed(`检测到的包管理器: ${packageManager}`);

    spinner.info('安装 Jest...');
    await installJest(packageManager);
    spinner.succeed('Jest 安装成功。');

    spinner.start('写入 Jest 配置...');
    await updatePackageJsonScripts({
      test: 'jest',
    });
    await writeJestConfig();
    spinner.succeed('Jest 配置写入成功。');
  } catch (error) {
    spinner.fail(`操作失败: ${(error as Error).message}`);
  }
}

export default init;
