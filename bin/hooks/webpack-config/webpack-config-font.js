import {
  hooks,
  positions,
  environments,
  register
} from '../../../lib/hooks';

register(hooks.WEBPACK_CONFIG, (config) => {
  config.webpack.module.rules.push({
    test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
    use: [ {
      loader: 'url-loader',
      options: {
        limit: 10000,
        mimetype: 'application/font-woff'
      }
    } ]
  }, {
    test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
    use: [ {
      loader: 'url-loader',
      options: {
        limit: 10000,
        mimetype: 'application/font-woff'
      }
    } ]
  }, {
    test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
    use: [ {
      loader: 'url-loader',
      options: {
        limit: 10000,
        mimetype: 'application/octet-stream'
      }
    } ]
  }, {
    test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
    use: [ {
      loader: 'file-loader',
      options: {
        limit: 10000,
        mimetype: 'application/vnd.ms-fontobject'
      }
    } ]
  });
}, { position: positions.BEFORE, environments: environments.CLIENT });

register(hooks.WEBPACK_CONFIG, (config) => {
  config.webpack.module.rules.push({
    test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'ignore-loader'
  }, {
    test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'ignore-loader'
  }, {
    test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'ignore-loader'
  }, {
    test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'ignore-loader'
  });
}, { position: positions.BEFORE, environments: environments.SERVER });
