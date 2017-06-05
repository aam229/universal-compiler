import webpack from 'webpack';
import {
  hooks,
  positions,
  environments,
  register
} from '../../../lib/hooks';

register([ hooks.WEBPACK_CONFIG_APPLICATION_BUILD_SERVER ], (config) => {
  if (!config.compiler.buildServer.hmr) {
    return;
  }
  const hmrEventPath = `http://${config.compiler.buildServer.host}:${config.compiler.buildServer.port}/webpack_hmr`;
  config.webpack.entry.main.push(`webpack-hot-middleware/client?path=${hmrEventPath}`);
  config.webpack.plugins.push(new webpack.HotModuleReplacementPlugin());
}, { position: positions.BEFORE, environments: environments.CLIENT });
