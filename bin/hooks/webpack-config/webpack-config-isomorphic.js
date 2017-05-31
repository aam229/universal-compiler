import path from 'path';

import AssetFilesPlugin from './webpack-plugins/AssetFilesPlugin';

import {
  hooks,
  positions,
  environments,
  register,
} from '../../../lib/hooks';

register([ hooks.WEBPACK_CONFIG_DLL_BUILD ], (config) => {
  config.webpack.plugins.push(new AssetFilesPlugin(
    path.resolve(config.compiler.serverOutputPath, 'client-dll-assets.json'),
    path.relative(config.compiler.rootPath, config.compiler.clientOutputPath)
  ));
}, { position: positions.BEFORE, environments: environments.CLIENT });

register([ hooks.WEBPACK_CONFIG_APPLICATION_BUILD ], (config) => {
  config.webpack.plugins.push(new AssetFilesPlugin(
    path.resolve(config.compiler.serverOutputPath, 'client-assets.json'),
    path.relative(config.compiler.rootPath, config.compiler.clientOutputPath)
  ));
}, { position: positions.BEFORE, environments: environments.CLIENT });
