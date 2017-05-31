import webpack from 'webpack';
import path from 'path';

import DLLEntryFilesPlugin from './webpack-plugins/DLLEntryFilesPlugin';
import DLLIgnorePlugin from './webpack-plugins/DLLIgnorePlugin';

import {
  hooks,
  positions,
  environments,
  register,
} from '../../../lib/hooks';

// Analyze
register([ hooks.WEBPACK_CONFIG_DLL_ANALYZE ], (config) => {
  config.webpack.plugins.push(new DLLEntryFilesPlugin(
    path.resolve(config.compiler.tempOutputPath, 'client-dll-entries.json'),
    config.compiler.dll.ignore
  ));
}, { position: positions.BEFORE, environments: environments.CLIENT });
register([ hooks.WEBPACK_CONFIG_DLL_ANALYZE ], (config) => {
  config.webpack.plugins.push(new DLLEntryFilesPlugin(
    path.resolve(config.compiler.tempOutputPath, 'server-dll-entries.json'),
    config.compiler.dll.ignore
  ));
}, { position: positions.BEFORE, environments: environments.SERVER });

// DLL Build
register([ hooks.WEBPACK_CONFIG_DLL_BUILD ], (config) => {
  config.webpack.plugins.push(new webpack.DllPlugin({
    path: path.resolve(config.compiler.tempOutputPath, 'client-dll-manifest.json'),
    name: 'dll_lib'
  }));
  config.webpack.plugins.push(DLLIgnorePlugin);
}, { position: positions.BEFORE, environments: environments.CLIENT });
register([ hooks.WEBPACK_CONFIG_DLL_BUILD ], (config) => {
  config.webpack.plugins.push(new webpack.DllPlugin({
    path: path.resolve(config.compiler.tempOutputPath, 'server-dll-manifest.json'),
    name: 'dll_lib'
  }));
  config.webpack.plugins.push(DLLIgnorePlugin);
}, { position: positions.BEFORE, environments: environments.SERVER });

// Application Build
register([ hooks.WEBPACK_CONFIG_APPLICATION_BUILD ], (config) => {
  config.webpack.plugins.push(new webpack.DllReferencePlugin({
    context: '.',
    manifest: path.resolve(config.compiler.tempOutputPath, 'client-dll-manifest.json')
  }));
}, { position: positions.BEFORE, environments: environments.CLIENT });

register([ hooks.WEBPACK_CONFIG_APPLICATION_BUILD ], (config) => {
  config.webpack.plugins.push(new webpack.DllReferencePlugin({
    context: '.',
    name: './server-dll',
    sourceType: 'commonjs',
    manifest: path.resolve(config.compiler.tempOutputPath, 'server-dll-manifest.json')
  }));
}, { position: positions.BEFORE, environments: environments.SERVER });
