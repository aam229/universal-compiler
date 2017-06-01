import ExtractTextPlugin from 'extract-text-webpack-plugin';

import {
  hooks,
  positions,
  environments,
  register,
} from '../../../lib/hooks';

register(hooks.WEBPACK_CONFIG, (config) => {
  config.webpack.resolve.extensions.push('.css');
  return config;
}, { position: positions.BEFORE, environments: environments.CLIENT });

// Extract CSS for client side compilation
register([ hooks.WEBPACK_CONFIG_DLL_BUILD, hooks.WEBPACK_CONFIG_APPLICATION_BUILD ], (config) => {
  config.webpack.module.rules.push({
    test: /\.css$/,
    loader: ExtractTextPlugin.extract('css-loader')
  });
  return config;
}, { position: positions.BEFORE, environments: environments.CLIENT });

register([ hooks.WEBPACK_CONFIG_DLL_ANALYZE ], (config) => {
  config.webpack.module.rules.push({
    test: /\.css(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'ignore-loader'
  });
  return config;
}, { position: positions.BEFORE, environments: environments.CLIENT });

register([ hooks.WEBPACK_CONFIG_DLL_BUILD ], (config) => {
  config.webpack.plugins.push(new ExtractTextPlugin({
    filename: 'client-dll.css',
    allChunks: true
  }));
  return config;
}, { position: positions.BEFORE, environments: environments.CLIENT });

register([ hooks.WEBPACK_CONFIG_APPLICATION_BUILD ], (config) => {
  config.webpack.plugins.push(new ExtractTextPlugin({
    filename: 'client.css',
    allChunks: true
  }));
  return config;
}, { position: positions.BEFORE, environments: environments.CLIENT });

// Ignore CSS for server side compilation as well as client side analysis
register(hooks.WEBPACK_CONFIG, (config) => {
  config.webpack.module.rules.push({
    test: /\.css(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'ignore-loader'
  });
  return config;
}, { position: positions.BEFORE, environments: environments.SERVER });
