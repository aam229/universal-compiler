import fs from 'fs';
import path from 'path';
import {
  hooks,
  positions,
  environments,
  register
} from '../../../lib/hooks';

register([ hooks.WEBPACK_CONFIG_DLL_ANALYZE, hooks.WEBPACK_CONFIG_APPLICATION_BUILD ], (config) => {
  config.compiler.plugins.forEach((plugin) => {
    config.webpack.entry.main.push(...plugin.hooks.client);
  });
  config.webpack.entry.main.push(path.resolve(__dirname, '../../../lib/client'));
  return config;
}, { position: positions.BEFORE, environments: environments.CLIENT });

register([ hooks.WEBPACK_CONFIG_DLL_ANALYZE, hooks.WEBPACK_CONFIG_APPLICATION_BUILD ], (config) => {
  config.compiler.plugins.forEach((plugin) => {
    config.webpack.entry.main.push(...plugin.hooks.server);
  });
  config.webpack.entry.main.push(path.resolve(__dirname, '../../../lib/server'));
  return config;
}, { position: positions.BEFORE, environments: environments.SERVER });

register([ hooks.WEBPACK_CONFIG_DLL_BUILD ], (config) => {
  config.webpack.entry = JSON.parse(fs.readFileSync(path.resolve(config.compiler.tempOutputPath, 'client-dll-entries.json')));
  return config;
}, { position: positions.BEFORE, environments: environments.CLIENT });

register([ hooks.WEBPACK_CONFIG_DLL_BUILD ], (config) => {
  config.webpack.entry = JSON.parse(fs.readFileSync(path.resolve(config.compiler.tempOutputPath, 'server-dll-entries.json')));
  return config;
}, { position: positions.BEFORE, environments: environments.SERVER });

register([ hooks.WEBPACK_CONFIG_DLL_BUILD, hooks.WEBPACK_CONFIG_APPLICATION_BUILD ], (config) => {
  config.webpack.entry.main.unshift(path.resolve(__dirname, '../../../lib/server-source-maps'));
  return config;
}, { position: positions.BEFORE, environments: environments.SERVER });
