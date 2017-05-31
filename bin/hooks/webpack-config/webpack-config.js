import lodash from 'lodash';
import webpack from 'webpack';
import webpackConfigTemplate from './webpack-config.template.json';
import {
  hooks,
  positions,
  environments,
  register,
} from '../../../lib/hooks';

register(hooks.WEBPACK_CONFIG, (config) => {
  config.webpack = lodash.merge(webpackConfigTemplate, config.webpack);
}, { position: positions.BEFORE, priority: 100000 });

register(hooks.WEBPACK_CONFIG, (config) => {
  config.webpack.target = 'web';
}, { position: positions.BEFORE, environments: [ environments.CLIENT ] });

register(hooks.WEBPACK_CONFIG, (config) => {
  config.webpack.target = 'node';
}, { position: positions.BEFORE, environments: [ environments.SERVER ] });

register(hooks.WEBPACK_CONFIG_DLL_BUILD, (config) => {
  config.webpack.plugins.push(new webpack.IgnorePlugin(/universal-compiler\//));
}, { position: positions.BEFORE });
