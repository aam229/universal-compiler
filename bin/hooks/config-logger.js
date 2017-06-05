import {
  hooks,
  positions,
  register
} from '../../lib/hooks';
import {
  logConfig
} from '../util';

register([ hooks.COMPILER_CONFIG ], (config) => {
  if (config.verbose) {
    logConfig('compiler', config);
  }
}, { position: positions.BEFORE, priority: -100000 });

register(hooks.WEBPACK_CONFIG, (config) => {
  if (config.compiler.verbose) {
    logConfig('webpack', config.webpack);
  }
}, { position: positions.BEFORE, priority: -100000 });
