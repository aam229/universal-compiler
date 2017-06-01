import webpack from 'webpack';

import {
  hooks,
  positions,
  environments,
  register
} from '../../../lib/hooks';

register([ hooks.WEBPACK_CONFIG_DLL_BUILD, hooks.WEBPACK_CONFIG_APPLICATION_BUILD ], (config) => {
  config.webpack.output.path = config.compiler.clientOutputPath;
}, { position: positions.BEFORE, environments: environments.CLIENT });

register([ hooks.WEBPACK_CONFIG_DLL_BUILD ], (config) => {
  config.webpack.output.filename = 'client-dll.js';
  config.webpack.output.library = 'dll_lib';
  config.webpack.output.libraryTarget = 'window';
}, { position: positions.BEFORE, environments: environments.CLIENT });

register([ hooks.WEBPACK_CONFIG_APPLICATION_BUILD ], (config) => {
  config.webpack.output.filename = 'client.js';
}, { position: positions.BEFORE, environments: environments.CLIENT });

register([ hooks.WEBPACK_CONFIG_DLL_BUILD, hooks.WEBPACK_CONFIG_APPLICATION_BUILD ], (config) => {
  config.webpack.output.path = config.compiler.serverOutputPath;
}, { position: positions.BEFORE, environments: environments.SERVER });

register([ hooks.WEBPACK_CONFIG_DLL_BUILD ], (config) => {
  config.webpack.output.filename = 'server-dll.js';
  config.webpack.output.libraryTarget = 'commonjs2';
}, { position: positions.BEFORE, environments: environments.SERVER });

register([ hooks.WEBPACK_CONFIG_APPLICATION_BUILD ], (config) => {
  config.webpack.output.filename = 'server.js';
}, { position: positions.BEFORE, environments: environments.SERVER });

// Source maps
register([ hooks.WEBPACK_CONFIG_DLL_BUILD, hooks.WEBPACK_CONFIG_APPLICATION_BUILD ], (config) => {
  if (config.compiler.sourceMap.client) {
    config.webpack.devtool = 'cheap-module-eval-source-map';
  }
}, { position: positions.BEFORE, environments: [ environments.DEVELOPMENT, environments.CLIENT ] });

register([ hooks.WEBPACK_CONFIG_DLL_BUILD, hooks.WEBPACK_CONFIG_APPLICATION_BUILD ], (config) => {
  if (config.compiler.sourceMap.client) {
    config.webpack.devtool = 'source-map';
  }
}, { position: positions.BEFORE, environments: [ environments.PRODUCTION, environments.CLIENT ] });

register([ hooks.WEBPACK_CONFIG_DLL_BUILD, hooks.WEBPACK_CONFIG_APPLICATION_BUILD ], (config) => {
  if (config.compiler.sourceMap.server) {
    config.webpack.devtool = 'source-map';
  }
}, { position: positions.BEFORE, environments: [ environments.DEVELOPMENT, environments.SERVER ] });

// Uglify
register([ hooks.WEBPACK_CONFIG_DLL_BUILD, hooks.WEBPACK_CONFIG_APPLICATION_BUILD ], (config) => {
  config.webpack.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  }));
}, { position: positions.BEFORE, environments: [ environments.PRODUCTION ] });
