import chalk from 'chalk';
import webpack from 'webpack';
import MemoryFS from 'memory-fs';

import {
  execute,
  hooks
} from '../../lib/hooks';
import {
  configureEnvironment
} from '../environment';


const compilerConfig = execute(hooks.COMPILER_CONFIG, configureEnvironment(), c => c);
const config = execute(hooks.WEBPACK_CONFIG_DLL_ANALYZE, { compiler: compilerConfig, webpack: {} }, c => c);

console.log(chalk.green.bold(`Getting entry files for ${process.env.JS_ENV} (${process.env.NODE_ENV})`));
const compiler = webpack(config.webpack);
compiler.outputFileSystem = new MemoryFS();
compiler.run(() => {
  console.log(chalk.green.bold('Done!'));
});
