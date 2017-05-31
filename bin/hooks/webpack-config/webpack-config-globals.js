import webpack from 'webpack';
import {
  hooks,
  positions,
  register
} from '../../../lib/hooks';

register(hooks.WEBPACK_CONFIG, (config) => {
  config.webpack.plugins.push(
    new webpack.DefinePlugin(config.compiler.globals)
  );
}, { position: positions.BEFORE });
