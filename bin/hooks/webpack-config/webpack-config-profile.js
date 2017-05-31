import path from 'path';
import StatsPlugin from 'stats-webpack-plugin';

import {
  hooks,
  positions,
  environments,
  register
} from '../../../lib/hooks';

// Output file name
register([ hooks.WEBPACK_CONFIG_DLL_BUILD ], (config) => {
  if (config.compiler.profile) {
    config.webpack.profile = true;
    config.webpack.plugins.push(new StatsPlugin(path.join(
      path.relative(config.compiler.clientOutputPath, config.compiler.tempOutputPath),
      'client-dll-profile.json'
    )));
  }
  return config;
}, { position: positions.BEFORE, environments: environments.CLIENT });

register([ hooks.WEBPACK_CONFIG_DLL_BUILD ], (config) => {
  if (config.compiler.profile) {
    config.webpack.profile = true;
    config.webpack.plugins.push(new StatsPlugin(path.join(
      path.relative(config.compiler.clientOutputPath, config.compiler.tempOutputPath),
      'server-dll-profile.json'
    )));
  }
  return config;
}, { position: positions.BEFORE, environments: environments.SERVER });

register([ hooks.WEBPACK_CONFIG_APPLICATION_BUILD ], (config) => {
  if (config.compiler.profile) {
    config.webpack.profile = true;
    config.webpack.plugins.push(new StatsPlugin(path.join(
      path.relative(config.compiler.clientOutputPath, config.compiler.tempOutputPath),
      'client-profile.json'
    )));
  }
  return config;
}, { position: positions.BEFORE, environments: environments.CLIENT });

register([ hooks.WEBPACK_CONFIG_APPLICATION_BUILD ], (config) => {
  if (config.compiler.profile) {
    config.webpack.profile = true;
    config.webpack.plugins.push(new StatsPlugin(path.join(
      path.relative(config.compiler.clientOutputPath, config.compiler.tempOutputPath),
      'server-profile.json'
    )));
  }
  return config;
}, { position: positions.BEFORE, environments: environments.SERVER });
