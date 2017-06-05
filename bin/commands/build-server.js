#! /usr/bin/env node

import chalk from 'chalk';
import Express from 'express';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import {
  execute,
  hooks
} from '../../lib/hooks';
import {
  configureEnvironment
} from '../environment';

const isDLL = process.argv.indexOf('dll') !== -1;
const isApplication = process.argv.indexOf('application') !== -1 || process.argv.indexOf('app') !== -1;

if (isDLL || isApplication) {
  console.log(chalk.orange.bold('The build server can only build the application. The build type specified in the arguments will be ignored'));
}
const buildType = 'application';
const buildHook = hooks.WEBPACK_CONFIG_APPLICATION_BUILD_SERVER;

const compilerConfig = execute(hooks.COMPILER_CONFIG, configureEnvironment('client'), c => c);
const config = execute(buildHook, { compiler: compilerConfig, webpack: {} }, c => c);

const compiler = webpack(config.webpack);
compiler.plugin('compilation', () => {
  console.log(chalk.green.bold(`Building ${buildType} for ${process.env.JS_ENV} (${process.env.NODE_ENV})`));
});
compiler.plugin('emit', (compilation, callback) => {
  console.log(`Current time: ${chalk.white.bold(new Date())}`);
  callback();
});

const port = config.compiler.buildServer.port;
const webpackMiddlewareOptions = {
  contentBase: config.webpack.publicPath,
  quiet: false,
  noInfo: false,
  hot: true,
  inline: true,
  lazy: false,
  headers: { 'Access-Control-Allow-Origin': '*' },
  stats: {
    hash: true,
    version: true,
    timings: true,
    assets: true,
    chunks: false,
    colors: true
  }
};
const webpackHotMiddlewareOptions = {
  log: false,
  path: '/webpack_hmr',
};

const app = new Express();
app.use(webpackMiddleware(compiler, webpackMiddlewareOptions));

if (config.compiler.buildServer.hmr) {
  app.use(webpackHotMiddleware(compiler, webpackHotMiddlewareOptions));
}

app.listen(port, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(chalk.green.bold(`Webpack client server listening on port ${port}`));
  }
});
