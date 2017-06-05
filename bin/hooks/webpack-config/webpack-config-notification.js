import WebpackNotifierPlugin from 'webpack-notifier';
import {
  hooks,
  positions,
  register,
} from '../../../lib/hooks';

function getTitle(target) {
  const env = process.env.JS_ENV === 'server' ? 'Server' : 'Client';
  return `UC - ${env} ${target}`;
}

register(hooks.WEBPACK_CONFIG_DLL_ANALYZE, (config) => {
  if (config.compiler.notifications) {
    config.webpack.plugins.push(new WebpackNotifierPlugin({
      alwaysNotify: true,
      title: getTitle('analysis')
    }));
  }
}, { position: positions.BEFORE, priority: 100000 });
register(hooks.WEBPACK_CONFIG_DLL_BUILD, (config) => {
  if (config.compiler.notifications) {
    config.webpack.plugins.push(new WebpackNotifierPlugin({
      alwaysNotify: true,
      title: getTitle('DLL')
    }));
  }
}, { position: positions.BEFORE, priority: 100000 });
register([ hooks.WEBPACK_CONFIG_APPLICATION_BUILD, hooks.WEBPACK_CONFIG_APPLICATION_BUILD_SERVER ], (config) => {
  if (config.compiler.notifications) {
    config.webpack.plugins.push(new WebpackNotifierPlugin({
      alwaysNotify: true,
      title: getTitle('application')
    }));
  }
}, { position: positions.BEFORE, priority: 100000 });
