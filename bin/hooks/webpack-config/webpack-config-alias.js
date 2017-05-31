import {
  hooks,
  positions,
  register
} from '../../../lib/hooks';

register(hooks.WEBPACK_CONFIG, (config) => {
  config.webpack.resolve.alias['application-runtime-config'] = config.compiler.runtimeConfigPath;
  return config;
}, { position: positions.BEFORE });
