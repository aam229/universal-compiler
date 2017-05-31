import lodash from 'lodash';
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import chalk from 'chalk';

import compilerConfigTemplate from './compiler-config.template.json';
import {
  hooks,
  positions,
  register,
} from '../../../lib/hooks';

function createFolder(absolutePath) {
  if (!fs.existsSync(absolutePath)) {
    console.log(chalk.yellow(`Creating missing directory '${absolutePath}'`));
    mkdirp.sync(absolutePath);
  }
  return absolutePath;
}

register(hooks.COMPILER_CONFIG, (config) => {
  config = lodash.merge(compilerConfigTemplate, config);
  config.globals = lodash.merge(config.globals, {
    'process.env.JS_ENV': JSON.stringify(process.env.JS_ENV),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  });
  config.environment = [ process.env.NODE_ENV, process.env.JS_ENV ];
  config.rootPath = path.resolve(process.cwd(), config.rootPath || '.');

  if (typeof config.runtimeConfigPath !== 'string') {
    throw new Error('The compiler config\'s runtimeConfigPath property should be string');
  }
  config.runtimeConfigPath = path.resolve(config.rootPath, config.runtimeConfigPath);
  if (!fs.existsSync(config.runtimeConfigPath)) {
    throw new Error(`The compiler config's runtimeConfigPath file (${config.runtimeConfigPath}) does not exist`);
  }

  if (typeof config.clientOutputPath !== 'string') {
    throw new Error('The compiler config\'s clientOutputPath property should be string');
  }
  config.clientOutputPath = createFolder(path.resolve(config.rootPath, config.clientOutputPath));

  if (typeof config.serverOutputPath !== 'string') {
    throw new Error('The compiler config\'s serverOutputPath property should be string');
  }
  config.serverOutputPath = createFolder(path.resolve(config.rootPath, config.serverOutputPath));

  if (typeof config.tempOutputPath !== 'string') {
    throw new Error('The compiler config\'s tempOutputPath property should be string');
  }
  config.tempOutputPath = createFolder(path.resolve(config.rootPath, config.tempOutputPath));
  return config;
}, { position: positions.BEFORE, priority: 100000 });
