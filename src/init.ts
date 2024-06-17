import ora from 'ora';

async function init() {
  const spinner = ora('分析项目中...').start();

  spinner.succeed('初始化成功');
}

export default init;
