import {
  hooks,
  positions,
  environments,
  register,
} from '../../../lib/hooks';

register(hooks.WEBPACK_CONFIG, (config) => {
  config.webpack.module.rules.push({
    test: /\.png(\?v=\d+\.\d+\.\d+)?$/,
    use: [ {
      loader: 'url-loader',
      options: {
        limit: 10000,
        mimetype: 'image/png'
      }
    } ]
  }, {
    test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
    use: [ {
      loader: 'url-loader',
      options: {
        limit: 10000,
        mimetype: 'image/svg+xml'
      }
    } ]
  });
}, { position: positions.BEFORE, environments: environments.CLIENT });

register(hooks.WEBPACK_CONFIG, (config) => {
  config.webpack.module.rules.push({
    test: /\.png(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'ignore-loader'
  }, {
    test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'ignore-loader'
  });
}, { position: positions.BEFORE, environments: environments.SERVER });
