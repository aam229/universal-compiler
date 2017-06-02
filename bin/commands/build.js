#! /usr/bin/env node

import chalk from 'chalk';
import webpack from 'webpack';
import {
  execute,
  hooks
} from '../../lib/hooks';
import {
  configureEnvironment
} from '../environment';

const isDLL = process.argv.indexOf('dll') !== -1;
const isApplication = process.argv.indexOf('application') !== -1 || process.argv.indexOf('app') !== -1;

if (!isDLL && !isApplication) {
  console.log(chalk.red.bold('The command\'s arguments should specify the type of build (app/application or dll)'));
  process.exit(0);
} else if (isDLL && isApplication) {
  console.log(chalk.red.bold('The command\'s arguments should contain only one of app/application or dll'));
  process.exit(0);
}
const buildType = isDLL ? 'dll' : 'application';
const buildHook = isDLL ? hooks.WEBPACK_CONFIG_DLL_BUILD : hooks.WEBPACK_CONFIG_APPLICATION_BUILD;

const compilerConfig = execute(hooks.COMPILER_CONFIG, configureEnvironment(), c => c);
const config = execute(buildHook, { compiler: compilerConfig, webpack: {} }, c => c);

console.log(chalk.green.bold(`Building ${buildType} for ${process.env.JS_ENV} (${process.env.NODE_ENV})`));
const compiler = webpack(config.webpack);
compiler.run((err, stats) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stats.toString({
    hash: true,
    version: true,
    timings: true,
    assets: true,
    chunks: false,
    colors: true
  }));
});
