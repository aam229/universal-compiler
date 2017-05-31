import {
  hooks,
  positions,
  register
} from '../../../lib/hooks';

register(hooks.WEBPACK_CONFIG, (config) => {
  config.webpack.resolve.extensions.push('.json');
  config.webpack.module.rules.push({
    test: /\.json$/,
    use: [ 'json-loader' ]
  });
}, { position: positions.BEFORE });
