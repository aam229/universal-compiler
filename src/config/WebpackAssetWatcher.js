import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

const MAX_WAIT = 30 * 1000;
const INTERVAL = 100;

class Watcher {
  constructor(p) {
    this.path = p;
  }

  load() {
    if (fs.existsSync(this.path)) {
      return Promise.resolve(this.read());
    }
    console.log(chalk.yellow(`Waiting on ${this.path}`));
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!fs.existsSync(this.path)) {
          return;
        }
        clearTimeout(failTimeout); // eslint-disable-line no-use-before-define
        clearInterval(checkInterval);
        resolve(this.read());
      }, INTERVAL);
      const failTimeout = setTimeout(() => {
        clearInterval(checkInterval);
        console.log(chalk.red(`Stopped waiting on ${this.path}`));
        reject(new Error('Maximum wait exceeded'));
      }, MAX_WAIT);
    });
  }

  read() {
    const config = JSON.parse(fs.readFileSync(this.path));
    let publicPath = config.publicPath;
    if (!publicPath.startsWith('http')) {
      publicPath = path.resolve(publicPath);
      if (!publicPath.endsWith(path.sep)) {
        publicPath = `${publicPath}${path.sep}`;
      }
    }
    console.log(chalk.green(`Loaded assets from ${this.path}`));
    return {
      javascript: config.javascript.map(p => publicPath + p),
      styles: config.styles.map(p => publicPath + p)
    };
  }
}

export default class ConfigWatcher {
  constructor(...paths) {
    this.watchers = paths
      .filter(p => !!p)
      .map(p => new Watcher(p));
  }

  load() {
    return Promise.all(this.watchers.map(watcher => watcher.load()))
      .then((configs) => {
        const out = { javascript: [], styles: [] };
        configs.forEach((config) => {
          out.javascript = config.javascript ? out.javascript.concat(config.javascript) : out.javascript;
          out.styles = config.styles ? out.styles.concat(config.styles) : out.styles;
          return out;
        });
        return out;
      });
  }
}
