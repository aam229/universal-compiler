import prettyjson from 'prettyjson';
import chalk from 'chalk';

export function logConfig(configName, config) {
  console.log(chalk.cyan.bold(`Start ${configName} config: `));
  console.log(prettyjson.render(config, { keysColor: 'cyan' }, 4));
  console.log(chalk.cyan.bold(`End ${configName} config`));
}

